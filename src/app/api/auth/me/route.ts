import { verifyRequest } from '@/lib/auth/verify';
import { resolvePayloadUser } from '@/lib/auth/resolve-user';

export const runtime = 'nodejs';

/**
 * Returns the currently authenticated user as Payload sees them.
 *
 * Frontend calls this on app load to:
 *   - Confirm the Cognito token is still valid server-side
 *   - Trigger auto-provisioning on first login (creates the Payload row)
 *   - Get the role and Payload user id needed for downstream operations
 */
export async function GET(req: Request) {
  const claims = await verifyRequest(req);
  if (!claims) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const user = await resolvePayloadUser(claims);
    return Response.json({
      id: user.id,
      email: user.email,
      name: (user as { name?: string }).name,
      role: (user as { role?: string }).role,
      authSource: (user as { authSource?: string }).authSource,
    });
  } catch (err) {
    console.error('[auth/me] failed to resolve user:', err);
    return Response.json({ error: 'Failed to resolve user' }, { status: 500 });
  }
}
