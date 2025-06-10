// File: functions/api/settings.ts
/// <reference types="@cloudflare/workers-types" />

/**
 * Defines the shape of a single provider configuration.
 * This is the data structure we will store in an array in KV.
 */
interface ProviderConfig {
  id: number;
  displayName: string;
  provider: 'resend' | 'brevo';
  credentials: {
    apiKey: string;
  };
}

/** Defines the environment bindings Cloudflare will provide to our function. */
interface Env {
  FLOW_KV: KVNamespace;
    // This key MUST be set as a secret in the Cloudflare dashboard
    MASTER_ENCRYPTION_KEY: string;
}

// --- CRYPTOGRAPHY HELPERS ---

/**
 * Derives a cryptographic key from the master key string in the environment.
 * This uses SHA-256 to create a fixed-size key suitable for AES-GCM.
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
 * Encrypts a plaintext string using AES-GCM.
 * The IV is prepended to the ciphertext, and the result is Base64-encoded.
 */
async function encrypt(text: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes is recommended for AES-GCM
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

// --- API FUNCTIONS ---


/**
 * Handles PUT requests to /api/settings. This function validates the incoming
 * array of provider configurations and saves it to the Cloudflare KV store.
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const providers: ProviderConfig[] = await request.json();

    // --- Validation ---
    // Ensure the body is an array. We can add more specific validation
    // for each object in the array if needed later.
    if (!Array.isArray(providers)) {
      const responseBody = JSON.stringify({ success: false, message: 'Request body must be an array of provider configurations.' });
      return new Response(responseBody, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // --- Authentication & Authorization ---
    // TODO: Add Firebase auth check here. Get tenantId from the user's custom claims.
    const tenantId = 'tenant_superadmin_test_01'; // Hardcoded for now
    const key = `tenant::${tenantId}`;

    // --- Data Storage ---
    const cryptoKey = await getDerivedKey(env);

    // Encrypt API keys before storing
    const encryptedProviders = await Promise.all(providers.map(async (p) => {
      // Only encrypt if the key is not empty
      if (p.credentials.apiKey) {
        const encryptedKey = await encrypt(p.credentials.apiKey, cryptoKey);
        return { ...p, credentials: { ...p.credentials, apiKey: encryptedKey } };
      }
      return p;
    }));

     // --- Data Storage (with cleanup logic) ---
    if (encryptedProviders.length === 0) {
      // If the final array of providers is empty, delete the key from KV.
      await env.FLOW_KV.delete(key);
    } else {
      // Otherwise, save the full encrypted array to KV.
      await env.FLOW_KV.put(key, JSON.stringify(encryptedProviders));
    }

    const successResponse = JSON.stringify({ success: true, message: 'Settings saved successfully!' });
    return new Response(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Error in settings PUT function:", error.message);
    const errorResponse = JSON.stringify({ success: false, message: 'An internal server error occurred.' });
    return new Response(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

/**
 * Handles GET requests to /api/settings.
 * Retrieves the tenant's provider configurations from KV and returns them as an array.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // TODO: Replace with real tenantId from auth in the future
    const tenantId = 'tenant_superadmin_test_01';
    const key = `tenant::${tenantId}`;

    // Fetch stored settings
    const raw = await env.FLOW_KV.get(key);

    // If no settings exist for this tenant, return an empty array.
    // This is valid and expected by the frontend.
    if (!raw) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Decryption ---
    const cryptoKey = await getDerivedKey(env);
    const providers: ProviderConfig[] = JSON.parse(raw);

    // Decrypt API keys before sending to the client
    const decryptedProviders = await Promise.all(providers.map(async (p) => {
      // Only decrypt if the key is not empty
      if (p.credentials.apiKey) {
        const decryptedKey = await decrypt(p.credentials.apiKey, cryptoKey);
        return { ...p, credentials: { ...p.credentials, apiKey: decryptedKey } };
      }
      return p;
    }));

    return new Response(JSON.stringify(decryptedProviders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (err: any) {
    console.error('Error in GET /api/settings:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};