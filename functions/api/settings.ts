// File: functions/api/settings.ts
/// <reference types="@cloudflare/workers-types" />

import { authenticate } from '../utils/auth-middleware'; // <-- NEW: Import our auth middleware

/**
 * Defines the shape of a single provider configuration.
 */
interface ProviderConfig {
  id: number;
  displayName: string;
  provider: 'resend' | 'brevo';
  credentials: {
    apiKey: string;
  };
}

/** * Defines the environment bindings Cloudflare will provide to our function.
 * NEW: It now includes all secrets needed by our authentication middleware.
 */
interface Env {
  FLOW_KV: KVNamespace;
  MASTER_ENCRYPTION_KEY: string;
  FIREBASE_SERVICE_ACCOUNT: string;
  ADMIN_SECRET_KEY: string;
}

// --- CRYPTOGRAPHY HELPERS (full implementation) ---

/**
 * Derives a secure cryptographic key from the master key string in the environment.
 * This uses PBKDF2, a standard key derivation function, to make the key
 * resistant to brute-force attacks.
 * @param env The environment object from Cloudflare.
 * @returns A promise that resolves to a CryptoKey suitable for AES-GCM.
 */
async function getDerivedKey(env: Env): Promise<CryptoKey> {
  if (!env.MASTER_ENCRYPTION_KEY || env.MASTER_ENCRYPTION_KEY.length < 32) {
      throw new Error('MASTER_ENCRYPTION_KEY must be defined in environment and be at least 32 characters long.');
  }
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.MASTER_ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(16), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string using the AES-GCM algorithm.
 * A new, random Initialization Vector (IV) is generated for each encryption
 * and prepended to the ciphertext to ensure security. The result is Base64-encoded
 * for safe storage in JSON.
 * @param text The plaintext string to encrypt.
 * @param key The CryptoKey to use for encryption.
 * @returns A promise that resolves to the Base64-encoded ciphertext string.
 */

async function encrypt(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a Base64-encoded ciphertext string using AES-GCM.
 * It separates the prepended IV from the ciphertext and uses it for decryption,
 * which also verifies the authenticity of the data.
 * @param encryptedText The Base64-encoded string to decrypt.
 * @param key The CryptoKey to use for decryption.
 * @returns A promise that resolves to the original plaintext string.
 */
async function decrypt(encryptedText: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
  
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
// --- API FUNCTIONS (NOW SECURED) ---

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    // --- NEW: Authentication ---
    // This line protects the function. It will throw an error if the token is invalid.
    const decodedToken = await authenticate(context);

    // Get tenantId from the verified token, NOT from a hardcoded value.
    const tenantId = decodedToken.tenantId as string;
    if (!tenantId) {
      return new Response('No tenantId found in user token.', { status: 400 });
    }
    
    const { request, env } = context;
    const providers: ProviderConfig[] = await request.json();

    if (!Array.isArray(providers)) {
      return new Response(JSON.stringify({ success: false, message: 'Request body must be an array.' }), { status: 400 });
    }

    const key = `tenant::${tenantId}`; // <-- Now uses the dynamic tenantId

    const cryptoKey = await getDerivedKey(env);
    const encryptedProviders = await Promise.all(providers.map(async (p) => {
      if (p.credentials.apiKey) {
        const encryptedKey = await encrypt(p.credentials.apiKey, cryptoKey);
        return { ...p, credentials: { ...p.credentials, apiKey: encryptedKey } };
      }
      return p;
    }));
    
    if (encryptedProviders.length === 0) {
      await env.FLOW_KV.delete(key);
    } else {
      await env.FLOW_KV.put(key, JSON.stringify(encryptedProviders));
    }

    return new Response(JSON.stringify({ success: true, message: 'Settings saved successfully!' }), { status: 200 });

  } catch (error: any) {
    // The authenticate function throws an error on failure, which this will catch.
    return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
  }
};


export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // --- NEW: Authentication ---
    const decodedToken = await authenticate(context);
    const tenantId = decodedToken.tenantId as string;
    if (!tenantId) {
        return new Response('No tenantId found in user token.', { status: 400 });
    }

    const { env } = context;
    const key = `tenant::${tenantId}`; // <-- Now uses the dynamic tenantId

    const raw = await env.FLOW_KV.get(key);

    if (!raw) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const cryptoKey = await getDerivedKey(env);
    const providers: ProviderConfig[] = JSON.parse(raw);
    const decryptedProviders = await Promise.all(providers.map(async (p) => {
      if (p.credentials.apiKey) {
        const decryptedKey = await decrypt(p.credentials.apiKey, cryptoKey);
        return { ...p, credentials: { ...p.credentials, apiKey: decryptedKey } };
      }
      return p;
    }));

    return new Response(JSON.stringify(decryptedProviders), { status: 200 });
    
  } catch (error: any) {
    // The authenticate function throws an error on failure, which this will catch.
    return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
  }
};