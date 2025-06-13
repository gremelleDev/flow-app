// File: functions/api/subscribers/[[id]].ts
/// <reference types="@cloudflare/workers-types" />

// Import the specific Env type and the handlers from our new logic file
import type { Env } from './_handlers';
import { handleGet, handlePost, handleDelete } from './_handlers';

/**
 * This is the main routing file for /api/subscribers/**.
 * It determines the request method and calls the appropriate handler.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  switch (context.request.method) {
    case 'GET':
      // This handles requests to /api/subscribers
      return handleGet(context);
    case 'POST':
      // This handles requests to /api/subscribers
      return handlePost(context);
    case 'DELETE':
      // This handles requests to /api/subscribers/[id]
      return handleDelete(context);
    default:
      // For any other method, return a 405 Method Not Allowed
      return new Response(`${context.request.method} is not allowed.`, {
        status: 405,
      });
  }
};