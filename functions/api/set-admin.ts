// File: functions/api/set-admin.ts
/// <reference types="@cloudflare/workers-types" />

// Import our new, lightweight helper functions
import { lookupUserByEmail, setCustomUserClaims } from '../utils/firebase-admin-api';

// Define the environment bindings we expect to be available
interface Env {
  FIREBASE_SERVICE_ACCOUNT: string;
  ADMIN_SECRET_KEY: string;
}

/**
 * Handles POST requests to /api/set-admin.
 * Sets a `superAdmin: true` custom claim on a Firebase user.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // --- Security Check ---
    const adminKey = request.headers.get('X-Admin-Secret');
    if (adminKey !== env.ADMIN_SECRET_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { email } = await request.json<{ email: string }>();
    if (!email) {
      return new Response(JSON.stringify({ success: false, message: 'Email is required.' }), { status: 400 });
    }
    
    // --- Core Logic using our new helper functions ---
    
    // 1. Look up the user by email to get their UID
    const user = await lookupUserByEmail(email, env);

    // 2. Set the custom claim on that user's UID
    await setCustomUserClaims(user.localId, { superAdmin: true }, env);

    const successResponse = JSON.stringify({ success: true, message: `Super admin claim set for ${email}` });
    return new Response(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' }});

  } catch (error: any) {
    console.error("Error in set-admin function:", error.message);
    const errorResponse = JSON.stringify({ success: false, message: error.message || 'An internal server error occurred.' });
    return new Response(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};