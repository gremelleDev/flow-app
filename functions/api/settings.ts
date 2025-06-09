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
  // TODO: Add MASTER_ENCRYPTION_KEY as a secret in the Cloudflare dashboard
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
    // TODO: Loop through the providers array and encrypt each provider's apiKey before storing.
    // For now, we store the entire array as a single JSON string.
    await env.FLOW_KV.put(key, JSON.stringify(providers));

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

    // Parse the stored JSON string and return the array of providers directly.
    const providers = JSON.parse(raw);
    return new Response(JSON.stringify(providers), {
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