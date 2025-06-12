// File: functions/api/subscribers/[[id]].ts
/// <reference types="@cloudflare/workers-types" />

import { authenticate } from '../../utils/auth-middleware';

// The shape of a subscriber object we'll store in KV
interface Subscriber {
  id: string;
  email: string;
  fullName?: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
}

// Define the environment bindings we expect to be available for all functions in this file
interface Env {
  FLOW_KV: KVNamespace;
  FIREBASE_SERVICE_ACCOUNT: string;
  ADMIN_SECRET_KEY: string;
}

/**
 * Handles GET requests to /api/subscribers.
 * Fetches all subscribers for the authenticated tenant.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const decodedToken = await authenticate(context);
    const tenantId = decodedToken.tenantId as string;
    if (!tenantId) {
      return new Response('No tenantId found in user token.', { status: 400 });
    }

    const { env } = context;
    const prefix = `tenant::${tenantId}::subscriber::`;
    const list = await env.FLOW_KV.list({ prefix });

    if (list.keys.length === 0) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    const promises = list.keys.map(key => env.FLOW_KV.get(key.name));
    const values = await Promise.all(promises);

    const subscribers = values
      .filter(value => value !== null)
      .map(value => JSON.parse(value!));

    return new Response(JSON.stringify(subscribers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
  }
};

/**
 * Handles POST requests to /api/subscribers.
 * Creates a new subscriber for the authenticated tenant.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
      const decodedToken = await authenticate(context);
      const tenantId = decodedToken.tenantId as string;
      if (!tenantId) {
        return new Response('No tenantId found in user token.', { status: 400 });
      }
      
      const { email, fullName } = await context.request.json<{ email: string, fullName?: string }>();
      if (!email) {
        return new Response(JSON.stringify({ message: 'Email is required.' }), { status: 400 });
      }
      
      const newSubscriber: Subscriber = {
        id: crypto.randomUUID(),
        email,
        fullName: fullName || '',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      const { env } = context;
      const key = `tenant::${tenantId}::subscriber::${newSubscriber.id}`;
      await env.FLOW_KV.put(key, JSON.stringify(newSubscriber));
      
      return new Response(JSON.stringify(newSubscriber), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      if (error.message.includes('token')) {
          return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
      }
      console.error("Error creating subscriber:", error);
      return new Response('An internal server error occurred.', { status: 500 });
    }
};

/**
 * Handles DELETE requests to /api/subscribers/[id].
 * Deletes a specific subscriber for the authenticated tenant.
 */
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const decodedToken = await authenticate(context);
    const tenantId = decodedToken.tenantId as string;

    const subscriberId = context.params.id as string;
    if (!subscriberId) {
      return new Response('Subscriber ID is required.', { status: 400 });
    }

    const { env } = context;
    const key = `tenant::${tenantId}::subscriber::${subscriberId}`;
    await env.FLOW_KV.delete(key);

    return new Response(null, { status: 204 });
  } catch (error: any) {
    if (error.message.includes('token')) {
      return new Response(error.message, { status: 401, statusText: 'Unauthorized' });
    }
    console.error("Error deleting subscriber:", error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
};