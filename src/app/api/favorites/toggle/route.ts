import { getPayload } from 'payload';
import config from '@payload-config';
import { z } from 'zod';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

const requestSchema = z.object({
  targetType: z.enum(['bridge', 'place']),
  targetId: z.string().min(1),
});

/**
 * Toggle favorite status for a bridge or place.
 *
 * Request: { targetType: 'bridge' | 'place', targetId: string }
 * Response: { favorited: boolean, id?: string }
 *
 * Atomic: if the favorite exists, deletes it; otherwise creates it.
 */
export async function POST(req: Request) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { targetType, targetId } = parsed.data;
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: 'favorites',
    where: {
      user: { equals: user.id },
      targetType: { equals: targetType },
      [targetType]: { equals: targetId },
    },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    await payload.delete({
      collection: 'favorites',
      id: existing.docs[0].id,
      overrideAccess: true,
    });
    return Response.json({ favorited: false });
  }

  const created = await payload.create({
    collection: 'favorites',
    data: {
      user: user.id,
      targetType,
      [targetType]: targetId,
    },
    overrideAccess: true,
  });

  return Response.json({ favorited: true, id: created.id });
}
