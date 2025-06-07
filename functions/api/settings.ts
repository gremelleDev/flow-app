// File: functions/api/settings.ts

/** The new, generic shape of our settings data from the frontend. */
interface GenericTenantSettings {
  name: string;
  provider: 'resend' | 'brevo'; // We can add more providers here later
  credentials: {
    apiKey: string;
  };
  sendingDomain: string;
  corsDomains: string[];
}

/** Defines the environment bindings Cloudflare will provide to our function. */
interface Env {
  FLOW_KV: KVNamespace;
  // TODO: Add MASTER_ENCRYPTION_KEY as a secret in the Cloudflare dashboard
}

/**
 * Handles PUT requests to /api/settings. This function validates the incoming
 * data and saves it to the Cloudflare KV store for a specific tenant.
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: GenericTenantSettings = await request.json();

    // --- Validation ---
    if (!body.name || !body.provider || !body.credentials?.apiKey) {
      const responseBody = JSON.stringify({ success: false, message: 'Missing required fields: name, provider, or API key.' });
      return new Response(responseBody, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // --- Authentication & Authorization ---
    // TODO: Add Firebase auth check here. Get tenantId from the user's custom claims.
    const tenantId = 'tenant_superadmin_test_01'; // Hardcoded for now
    const key = `tenant::${tenantId}`;

    // --- Data Storage ---
    // TODO: Encrypt body.credentials.apiKey before storing
    const settingsToStore = {
      name: body.name,
      provider: body.provider,
      credentials: body.credentials,
      sendingDomain: body.sendingDomain,
      corsDomains: body.corsDomains || [],
    };

    // Put the stringified JSON object into our KV namespace.
    await env.FLOW_KV.put(key, JSON.stringify(settingsToStore));

    const successResponse = JSON.stringify({ success: true, message: 'Settings saved successfully!' });
    return new Response(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Error in settings function:", error.message);
    const errorResponse = JSON.stringify({ success: false, message: 'An internal server error occurred.' });
    return new Response(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
