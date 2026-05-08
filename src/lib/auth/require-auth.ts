/**
 * Server-side helper for protected API routes.
 *
 * Wraps the JWT verification + Payload user resolution into a single call.
 * Use inside any /api/* route that requires authentication.
 *
 * Returns null when the request isn't authenticated — the route should
 * respond with 401 in that case.
 */
import { verifyRequest } from './verify';
import { resolvePayloadUser } from './resolve-user';

export async function requireAuth(req: Request) {
  const claims = await verifyRequest(req);
  if (!claims) return null;
  try {
    return await resolvePayloadUser(claims);
  } catch (err) {
    console.error('[requireAuth] resolve failed:', err);
    return null;
  }
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthenticated' }, { status: 401 });
}
