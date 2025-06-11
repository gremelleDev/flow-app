// File: functions/utils/auth-middleware.ts
/// <reference types="@cloudflare/workers-types" />

import { verifyIdToken } from './firebase-admin-api';

/**
 * An authentication middleware for Cloudflare Pages Functions.
 * It verifies the Firebase ID token from the Authorization header.
 * * @param context The PagesFunction context object.
 * @returns The decoded user token payload if successful.
 * @throws An error if the token is missing or invalid.
 */
export async function authenticate(context: EventContext<any, any, any>) {
  const { request, env } = context;

  // 1. Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header is missing or malformed.');
  }
  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // 2. Verify the token using our utility function
  try {
    const decodedToken = await verifyIdToken(token, env);
    return decodedToken;
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    throw new Error('Invalid or expired token.');
  }
}