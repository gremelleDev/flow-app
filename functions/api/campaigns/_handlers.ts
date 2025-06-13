// File: functions/api/campaigns/_handlers.ts
/// <reference types="@cloudflare/workers-types" />

import { authenticate } from '../../utils/auth-middleware';

// Define the shape of a Campaign object we'll store in KV.
// We'll expand on this later with email steps, etc.
export interface Campaign {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  createdAt: string;
  emails: Array<{
    id: string;
    subject: string;
    body: string; // We'll store email content as a string for now
    delayInHours: number;
  }>;
}

// Re-usable Env interface for our campaign functions
export interface Env {
  FLOW_KV: KVNamespace;
  FIREBASE_SERVICE_ACCOUNT: string;
  ADMIN_SECRET_KEY: string;
}

/**
 * Handles GET requests.
 * If an ID is present in the URL (/api/campaigns/[id]), it fetches a single campaign.
 * Otherwise (/api/campaigns), it fetches all campaigns for the tenant.
 */
export async function handleGet(context: EventContext<Env, any, Record<string, unknown>>) {
  try {
    // 1. Authenticate the request to get the tenantId
    const decodedToken = await authenticate(context);
    const tenantId = decodedToken.tenantId as string;
    if (!tenantId) {
      return new Response('No tenantId found in user token.', { status: 400 });
    }

    const { env, params } = context;
    const campaignId = params.id as string;

    // --- NEW: Logic to fetch a SINGLE campaign if an ID is provided ---
    if (campaignId) {
      const key = `tenant::${tenantId}::campaign::${campaignId}`;
      const campaignJson = await env.FLOW_KV.get(key);

      if (!campaignJson) {
        return new Response('Campaign not found.', { status: 404 });
      }

      return new Response(campaignJson, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Existing logic to fetch ALL campaigns ---

    // 2. Define the key prefix for this tenant's campaigns
    const prefix = `tenant::${tenantId}::campaign::`;

    // 3. List all keys in KV that match the prefix
    const list = await env.FLOW_KV.list({ prefix });

    if (list.keys.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 4. Fetch the full value for each campaign key
    const promises = list.keys.map(key => env.FLOW_KV.get(key.name));
    const values = await Promise.all(promises);

    // 5. Parse the campaign objects and filter out any potential nulls
    const campaigns = values
      .filter(value => value !== null)
      .map(value => JSON.parse(value!));

    return new Response(JSON.stringify(campaigns), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    if (error.message.includes('token')) {
      return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
    }
    console.error("Error fetching campaigns:", error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}

/**
 * Handles POST requests to /api/campaigns.
 * Creates a new campaign for the authenticated tenant.
 */
export async function handlePost(context: EventContext<Env, any, Record<string, unknown>>) {
    try {
      // 1. Authenticate the request to get the tenantId
      const decodedToken = await authenticate(context);
      const tenantId = decodedToken.tenantId as string;
      if (!tenantId) {
        return new Response('No tenantId found in user token.', { status: 400 });
      }
      
      // 2. Parse the incoming campaign data from the request body
      const { name, fromName, fromEmail } = await context.request.json<{ name: string, fromName: string, fromEmail: string }>();
  
      // 3. Validate the required fields
      if (!name || !fromName || !fromEmail) {
        const missing = [!name && 'name', !fromName && 'fromName', !fromEmail && 'fromEmail'].filter(Boolean).join(', ');
        return new Response(JSON.stringify({ message: `Missing required fields: ${missing}` }), { status: 400 });
      }
      
      // 4. Create the new campaign object
      const newCampaign: Campaign = {
        id: crypto.randomUUID(), // Generate a unique ID for the new campaign
        name,
        fromName,
        fromEmail,
        createdAt: new Date().toISOString(),
        emails: [],
      };
      
      // 5. Construct the unique key and save to Cloudflare KV
      const { env } = context;
      const key = `tenant::${tenantId}::campaign::${newCampaign.id}`;
      await env.FLOW_KV.put(key, JSON.stringify(newCampaign));
      
      // 6. Return the newly created campaign object
      return new Response(JSON.stringify(newCampaign), {
        status: 201, // 201 Created
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      if (error.message.includes('token')) {
        return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
      }
      console.error("Error creating campaign:", error);
      return new Response('An internal server error occurred.', { status: 500 });
    }
  }

/**
 * Handles PUT requests to /api/campaigns/[id].
 * Updates an existing campaign for the authenticated tenant.
 */
export async function handlePut(context: EventContext<Env, any, Record<string, unknown>>) {
    try {
      // 1. Authenticate the request to get the tenantId
      const decodedToken = await authenticate(context);
      const tenantId = decodedToken.tenantId as string;
      if (!tenantId) {
        return new Response('No tenantId found in user token.', { status: 400 });
      }
  
      // 2. Get the campaign ID from the URL path parameter
      const campaignId = context.params.id as string;
      if (!campaignId) {
        return new Response('Campaign ID is required.', { status: 400 });
      }
  
      // 3. Construct the exact key for the campaign to be updated
      const { env } = context;
      const key = `tenant::${tenantId}::campaign::${campaignId}`;
  
      // 4. Fetch the existing campaign from KV
      const existingCampaignJson = await env.FLOW_KV.get(key);
      if (!existingCampaignJson) {
        return new Response('Campaign not found.', { status: 404 });
      }
      const existingCampaign: Campaign = JSON.parse(existingCampaignJson);
  
      // 5. Parse the updated data from the request body
      const updates = await context.request.json<{ name?: string, fromName?: string, fromEmail?: string }>();
  
      // 6. Merge the updates into the existing campaign object
      // This ensures we only change the provided fields and don't lose other data.
      const updatedCampaign = {
        ...existingCampaign,
        ...updates,
      };
  
      // 7. Save the fully updated campaign object back to KV
      await env.FLOW_KV.put(key, JSON.stringify(updatedCampaign));
  
      // 8. Return the updated campaign object
      return new Response(JSON.stringify(updatedCampaign), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error: any) {
      if (error.message.includes('token')) {
        return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
      }
      console.error("Error updating campaign:", error);
      return new Response('An internal server error occurred.', { status: 500 });
    }
  }

/**
 * Handles DELETE requests to /api/campaigns/[id].
 * Deletes a specific campaign for the authenticated tenant.
 */
export async function handleDelete(context: EventContext<Env, any, Record<string, unknown>>) {
    try {
      // 1. Authenticate the request to get the tenantId
      const decodedToken = await authenticate(context);
      const tenantId = decodedToken.tenantId as string;
      if (!tenantId) {
        return new Response('No tenantId found in user token.', { status: 400 });
      }
  
      // 2. Get the campaign ID from the URL path parameter
      const campaignId = context.params.id as string;
      if (!campaignId) {
        return new Response('Campaign ID is required.', { status: 400 });
      }
  
      // 3. Construct the exact key for the campaign to be deleted
      const { env } = context;
      const key = `tenant::${tenantId}::campaign::${campaignId}`;
      
      // 4. Delete the key-value pair from the KV namespace
      await env.FLOW_KV.delete(key);
  
      // 5. Return a success response with no content
      return new Response(null, { status: 204 });
  
    } catch (error: any) {
      if (error.message.includes('token')) {
        return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
      }
      console.error("Error deleting campaign:", error);
      return new Response('An internal server error occurred.', { status: 500 });
    }
  }