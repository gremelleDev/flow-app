// File: src/utils/api.ts
import { auth } from './firebase'; // Import the auth service from our firebase.ts file

// This interface defines the shape of a single provider configuration.
// It will be used by both the fetch and update functions.
export interface ProviderConfig {
  id: number;
  displayName: string;
  provider: 'resend' | 'brevo';
  credentials: {
    apiKey: string;
  };
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

// --- NEW: Reusable Authenticated Fetch Helper ---
/**
 * A wrapper around the native `fetch` function that automatically
 * adds the Firebase Auth ID token to the request headers.
 * @param url The URL to fetch.
 * @param options The fetch options (method, body, etc.).
 * @returns The fetch Response object.
 */
async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found. Cannot make API call.');
  }

  const token = await user.getIdToken();

  const headers = new Headers(options.headers);
  headers.append('Authorization', `Bearer ${token}`);
  
  return fetch(url, { ...options, headers });
}


// --- STUBBED FUNCTIONS (no changes) ---

// 1. Fetch all campaigns for a tenant (stub)
export function getCampaigns(): Promise<Campaign[]> {
  // This will also need to be updated to use authedFetch when implemented.
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
): Promise<{ success:boolean }> {
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
      campaignName: 'Welcome Series',   // ← stub value
      formName: 'Homepage Signup',     // ← stub value
    },
  ]);
}

// 5. Update tenant provider settings
export async function updateProviders(
  providers: ProviderConfig[]
): Promise<{ success: boolean; message: string }> {
  
  // Our frontend now sends a PUT request with the entire provider array.
  // CHANGED: Using authedFetch instead of fetch
  const response = await authedFetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(providers),
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

/**
 * Fetches the current provider configurations from the backend.
 * Expects the API to return an array of ProviderConfig objects.
 */
export async function fetchProviders(): Promise<ProviderConfig[]> {
  // CHANGED: Using authedFetch instead of fetch
  const res = await authedFetch('/api/settings');

  if (!res.ok) {
    // Handle potential server errors
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to load provider settings');
  }
  
  // The backend now returns the array directly, even if it's empty.
  return (await res.json()) as ProviderConfig[];
}