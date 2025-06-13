// File: functions/api/campaigns/[[id]].ts
/// <reference types="@cloudflare/workers-types" />

// Import the types and handlers from our new logic file
import type { Env } from './_handlers';
import { handleGet, handlePost, handlePut, handleDelete } from './_handlers';

/**
 * This is the main routing file for /api/campaigns/**.
 * It determines the request method and calls the appropriate handler.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  switch (context.request.method) {
    case 'GET':
      return handleGet(context);
    case 'POST':
      return handlePost(context);
    case 'PUT':
      return handlePut(context);
    case 'DELETE':
      return handleDelete(context);
    default:
      return new Response(`${context.request.method} is not allowed.`, {
        status: 405,
      });
  }
};
