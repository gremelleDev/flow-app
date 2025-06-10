// File: functions/api/set-admin.ts
/// <reference types="@cloudflare/workers-types" />
import * as admin from 'firebase-admin';

// Define the environment bindings we expect to be available
interface Env {
  FIREBASE_SERVICE_ACCOUNT: string;
  ADMIN_SECRET_KEY: string; // <-- Our new security key
}

/**
 * Initializes the Firebase Admin SDK.
 * It ensures initialization only happens once.
 * @param env - The environment object from Cloudflare.
 */
function initializeFirebaseAdmin(env: Env) {
  if (admin.apps.length > 0) {
    return;
  }
  
  // Parse the service account key from the environment variable
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Handles POST requests to /api/set-admin.
 * Sets a `superAdmin: true` custom claim on a Firebase user.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    // --- Security Check ---
    // Check for our secret admin key in the headers
    const adminKey = request.headers.get('X-Admin-Secret');
    if (adminKey !== env.ADMIN_SECRET_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { email } = await request.json<{ email: string }>();
    if (!email) {
      return new Response(JSON.stringify({ success: false, message: 'Email is required.' }), { status: 400 });
    }

    // Initialize the Firebase Admin SDK
    initializeFirebaseAdmin(env);
    
    // Get the user by their email
    const user = await admin.auth().getUserByEmail(email);

    // Set the custom claim on their account
    await admin.auth().setCustomUserClaims(user.uid, { superAdmin: true });

    const successResponse = JSON.stringify({ success: true, message: `Super admin claim set for ${email}` });
    return new Response(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' }});

  } catch (error: any) {
    console.error("Error in set-admin function:", error.message);
    let errorMessage = 'An internal server error occurred.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found.';
    }
    const errorResponse = JSON.stringify({ success: false, message: errorMessage });
    return new Response(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};