// File: functions/api/subscribers.ts
/// <reference types="@cloudflare/workers-types" />

import { authenticate } from '../utils/auth-middleware';

// The shape of a subscriber object we'll store in KV
// Note: We might move this to a shared types file later
interface Subscriber {
  id: string;
  email: string;
  fullName?: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
}

// Define the environment bindings we expect to be available
interface Env {
  FLOW_KV: KVNamespace;
  FIREBASE_SERVICE_ACCOUNT: string;
  ADMIN_SECRET_KEY: string; // Not used here, but part of the standard Env
}


/**
 * Handles GET requests to /api/subscribers.
 * Fetches all subscribers for the authenticated tenant.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // 1. Authenticate the request
    const decodedToken = await authenticate(context);
    const tenantId = decodedToken.tenantId as string;

    if (!tenantId) {
      return new Response('No tenantId found in user token.', { status: 400 });
    }

    const { env } = context;
    const prefix = `tenant::${tenantId}::subscriber::`;

    // 2. List all subscriber keys for the tenant from KV
    const list = await env.FLOW_KV.list({ prefix });

    if (list.keys.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    
    // 3. Fetch the full value for each key
    const promises = list.keys.map(key => env.FLOW_KV.get(key.name));
    const values = await Promise.all(promises);

    // 4. Parse the values and filter out any nulls (if a get failed)
    const subscribers = values
      .filter(value => value !== null)
      .map(value => JSON.parse(value!));

    return new Response(JSON.stringify(subscribers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // The authenticate middleware throws an error on failure, which this will catch.
    return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
  }
};

// Add this to your existing 'functions/api/subscribers.ts' file

/**
 * Handles POST requests to /api/subscribers.
 * Creates a new subscriber for the authenticated tenant.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
      // 1. Authenticate the request and get tenantId
      const decodedToken = await authenticate(context);
      const tenantId = decodedToken.tenantId as string;
  
      if (!tenantId) {
        return new Response('No tenantId found in user token.', { status: 400 });
      }
  
      // 2. Parse the incoming subscriber data from the request body
      const { email, fullName } = await context.request.json<{ email: string, fullName?: string }>();
  
      if (!email) {
        return new Response(JSON.stringify({ message: 'Email is required.' }), { status: 400 });
      }
  
      // 3. Create the new subscriber object
      const newSubscriber: Subscriber = {
        id: crypto.randomUUID(), // Generate a unique ID for the new subscriber
        email,
        fullName: fullName || '', // Default to empty string if not provided
        status: 'active',
        createdAt: new Date().toISOString(),
      };
  
      // 4. Construct the unique key and save to KV
      const { env } = context;
      const key = `tenant::${tenantId}::subscriber::${newSubscriber.id}`;
      await env.FLOW_KV.put(key, JSON.stringify(newSubscriber));
  
      // 5. Return the newly created subscriber object
      return new Response(JSON.stringify(newSubscriber), {
        status: 201, // 201 Created is the appropriate status code
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error: any) {
      // Check if it's an auth error or a different server error
      if (error.message.includes('token')) {
          return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
      }
      console.error("Error creating subscriber:", error);
      return new Response('An internal server error occurred.', { status: 500 });
    }
  };