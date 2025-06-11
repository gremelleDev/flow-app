// File: functions/utils/firebase-admin-api.ts
import * as jose from 'jose';

// --- INTERFACES ---
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}
interface GoogleOAuth2Token {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// --- TOKEN CACHING ---
let token: GoogleOAuth2Token | null = null;
let tokenExpiry: Date | null = null;

// --- getAccessToken FUNCTION ---
async function getAccessToken(env: any): Promise<string> {
  if (token && tokenExpiry && tokenExpiry > new Date()) {
    return token.access_token;
  }
  const serviceAccount: ServiceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const privateKey = await jose.importPKCS8(serviceAccount.private_key, 'RS256');
  const assertion = await new jose.SignJWT({
     scope: 'https://www.googleapis.com/auth/identitytoolkit',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience(serviceAccount.token_uri)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }
  const tokenResponse: GoogleOAuth2Token = await response.json();
  token = tokenResponse;
  tokenExpiry = new Date(new Date().getTime() + tokenResponse.expires_in * 1000);
  return token.access_token;
}

// --- lookupUserByEmail FUNCTION ---
export async function lookupUserByEmail(email: string, env: any): Promise<{ localId: string;[key: string]: any }> {
  const accessToken = await getAccessToken(env);
  const serviceAccount: ServiceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const lookupUrl = `https://identitytoolkit.googleapis.com/v1/projects/${serviceAccount.project_id}/accounts:lookup`;

  const response = await fetch(lookupUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email: [email],
    }),
  });

  if (!response.ok) {
    // FIX: We tell TypeScript the expected shape of the error object.
    const error = await response.json() as { error: { message: string } };
    throw new Error(`Failed to look up user by email: ${error.error.message}`);
  }

  // FIX: We tell TypeScript the expected shape of the data object.
  const data = await response.json() as { users: { localId: string }[] };
  if (!data.users || data.users.length === 0) {
    throw new Error(`User not found for email: ${email}`);
  }
  return data.users[0];
}


// --- NEWLY IMPLEMENTED FUNCTION ---
/**
 * Sets custom claims for a given user UID using the Firebase Admin REST API.
 * @param uid - The user's UID (localId).
 * @param claims - The claims object to set.
 * @param env - The environment object from Cloudflare.
 */
export async function setCustomUserClaims(uid: string, claims: object, env: any): Promise<void> {
  const accessToken = await getAccessToken(env);
  const serviceAccount: ServiceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const updateUrl = `https://identitytoolkit.googleapis.com/v1/projects/${serviceAccount.project_id}/accounts:update`;

  const response = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      localId: uid,
      // The REST API requires the custom claims to be a stringified JSON object.
      customAttributes: JSON.stringify(claims),
    }),
  });

  if (!response.ok) {
    // FIX: We tell TypeScript the expected shape of the error object.
    const error = await response.json() as { error: { message: string } };
    throw new Error(`Failed to set custom claims: ${error.error.message}`);
  }
}