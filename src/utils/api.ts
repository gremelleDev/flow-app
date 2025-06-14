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
  id: string;
  email: string;
  fullName?: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  createdAt: string;
  emails: Array<{
    id: string;
    subject: string;
    body: string;
    delayInHours: number;
  }>;
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

/**
 * 1. Fetches all campaigns for the current tenant.
 */
export async function getCampaigns(): Promise<Campaign[]> {
  const res = await authedFetch('/api/campaigns');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to load campaigns');
  }
  return (await res.json()) as Campaign[];
}

/**
 * Fetches a single campaign by its ID.
 * @param campaignId The ID of the campaign to fetch.
 */
export async function getCampaign(campaignId: string): Promise<Campaign> {
  const res = await authedFetch(`/api/campaigns/${campaignId}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to load campaign');
  }
  
  return (await res.json()) as Campaign;
}

/**
 * 2. Creates a new campaign.
 * @param data The initial data for the new campaign.
 */
export async function createCampaign(data: { name: string; fromName: string; fromEmail: string }): Promise<Campaign> {
  const res = await authedFetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create campaign');
  }
  return (await res.json()) as Campaign;
}

/**
 * Deletes a campaign by its ID.
 * @param campaignId The ID of the campaign to delete.
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  const res = await authedFetch(`/api/campaigns/${campaignId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete campaign');
  }
}

/**
 * 3. Updates an existing campaign by its ID.
 * @param campaignId The ID of the campaign to update.
 * @param data An object containing the fields to update.
 */
export async function updateCampaign(
  campaignId: string,
  data: Partial<Omit<Campaign, 'id' | 'createdAt'>>
): Promise<Campaign> {
  const res = await authedFetch(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update campaign');
  }

  return (await res.json()) as Campaign;
}

// 4. Fetch all subscribers for a tenant (stub)
export async function getSubscribers(): Promise<Subscriber[]> {
  // This now makes a real, authenticated API call to our new endpoint
  const res = await authedFetch('/api/subscribers');

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to load subscribers');
  }
  
  return (await res.json()) as Subscriber[];
}


/**
 * Creates a new subscriber by calling the POST /api/subscribers endpoint.
 * @param data An object containing the new subscriber's email and fullName.
 * @returns The newly created subscriber object from the API.
 */
export async function createSubscriber(data: { email: string, fullName?: string }): Promise<Subscriber> {
  const res = await authedFetch('/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create subscriber');
  }

  return (await res.json()) as Subscriber;
}


// Add this new function to src/utils/api.ts

/**
 * Deletes a subscriber by calling the DELETE /api/subscribers/[id] endpoint.
 * @param subscriberId The ID of the subscriber to delete.
 */
export async function deleteSubscriber(subscriberId: string): Promise<void> {
  // Note the URL now includes the subscriberId
  const res = await authedFetch(`/api/subscribers/${subscriberId}`, {
    method: 'DELETE',
  });

  // A 204 No Content response is a success, but has no body to parse.
  // We only need to check if the response was not okay.
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete subscriber');
  }

  // No need to return anything on success.
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