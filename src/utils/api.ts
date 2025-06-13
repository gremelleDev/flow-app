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

// AFTER (Use this new interface)
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