// File: functions/api/settings.ts

/** The new, generic shape of our settings data from the frontend. */
interface GenericTenantSettings {
  name: string;
  provider: 'resend' | 'brevo'; // We can add more providers here later
  credentials: {
    apiKey: string;
       // Other provider-specific credentials could go here, e.g., region

  };
  sendingDomain: string;
  corsDomains: string[];
}

/** Defines the shape of a single subscriber. */
export interface Subscriber {
  fullName: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  campaignProgress: any[];
  campaignName?: string;
  formName?: string;
}

/** Defines the shape of an email campaign sequence. */
export interface Campaign {
  id: string;
  name:string;
  fromName: string;
  fromEmail: string;
  emails: Array<{ subject: string; body: string; delayInHours: number }>;
}

// --- API FUNCTIONS ---

// STUB: Fetches all campaigns for a tenant.
export function getCampaigns(): Promise<Campaign[]> {
  console.log("STUB: getCampaigns called");
  return Promise.resolve([
    {
      id: 'camp_1', name: 'Demo Welcome Series', fromName: 'Demo Sender', fromEmail: 'demo@example.com',
      emails: [{ subject: 'Welcome!', body: '<p>Hi there!</p>', delayInHours: 0 }],
    },
  ]);
}

// STUB: Fetches all subscribers for a tenant.
export function getSubscribers(): Promise<Subscriber[]> {
  console.log("STUB: getSubscribers called");
  return Promise.resolve([
    {
      fullName: 'Jane Doe', email: 'jane.doe@example.com', status: 'active',
      subscribedAt: '2025-06-06T17:10:00Z', campaignProgress: [],
      campaignName: 'Welcome Series', formName: 'Homepage Signup',
    },
  ]);
}

/**
 * REAL API CALL: Updates a tenant's settings by sending data to our backend.
 * @param settings - The tenant settings object to save.
 * @returns A promise that resolves with the server's response.
 */
export async function updateTenantSettings(
  settings: TenantSettings
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  const result = await response.json();

  if (!response.ok) {
    // If the server returns an error (e.g., 400, 500), throw an error
    // so the frontend `.catch()` block can handle it.
    throw new Error(result.message || 'An unknown error occurred while saving settings.');
  }

  return result;
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
