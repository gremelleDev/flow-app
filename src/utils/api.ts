// File: src/utils/api.ts

export interface TenantSettings {
  name: string;
  provider: 'resend'| 'brevo'; // We can add more providers here later
  credentials: {
    apiKey: string;
  };
  sendingDomain: string;
  corsDomains: string[];
}

export interface Subscriber {
  fullName: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  campaignProgress: any[];
  campaignName?: string;
  formName?: string;
}

export interface Campaign {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  emails: Array<{ subject: string; body: string; delayInHours: number }>;
}

// 1. Fetch all campaigns for a tenant (stub)
export function getCampaigns(): Promise<Campaign[]> {
  return Promise.resolve([
    {
      id: 'camp_1',
      name: 'Demo Welcome Series',
      fromName: 'Demo Sender',
      fromEmail: 'demo@example.com',
      emails: [
        {
          subject: 'Welcome!',
          body: '<p>Hi there!</p>',
          delayInHours: 0,
        },
      ],
    },
  ]);
}

// 2. Create a new campaign (stub)
export function createCampaign(): Promise<{ success: boolean }> {
  return Promise.resolve({ success: true });
}

// 3. Update a campaign by ID (stub)
export function updateCampaign(
  campaignId: string,
  data: Partial<Campaign>
): Promise<{ success: boolean }> {
  console.log('updateCampaign stub called with:', campaignId, data);
  return Promise.resolve({ success: true });
}

// 4. Fetch all subscribers for a tenant (stub)
export function getSubscribers(): Promise<Subscriber[]> {
  return Promise.resolve([
    {
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      status: 'active',
      subscribedAt: '2025-06-06T17:10:00Z',
      campaignProgress: [],
      campaignName: 'Welcome Series',  // ← stub value
      formName: 'Homepage Signup',     // ← stub value
    },
  ]);
}

// 5. Update tenant settings (NOW A REAL API CALL)
export async function updateTenantSettings(
  settings: TenantSettings
): Promise<{ success: boolean; message: string }> {
  
  // Our frontend now sends a PUT request to our new Cloudflare Function.
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    // If the server returns an error, try to parse the message,
    // otherwise throw a generic error.
    const errorResult = await response.json().catch(() => ({}));
    throw new Error(errorResult.message || 'Failed to save settings');
  }

  return response.json();
}

// 6. Public subscribe endpoint (stub)
export function subscribePublic(
  tenantId: string,
  fullName: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  console.log(
    'subscribePublic stub called with:',
    tenantId,
    fullName,
    email
  );
  return Promise.resolve({ success: true, message: 'Subscribed (stub)' });
}
