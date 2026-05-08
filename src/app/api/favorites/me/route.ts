import { getPayload } from 'payload';
import config from '@payload-config';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

/**
 * Returns the current user's favorites, with the related bridge or place
 * expanded one level deep. Used by the FavoritesProvider on app load.
 */
export async function GET(req: Request) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'favorites',
    where: { user: { equals: user.id } },
    limit: 200,
    depth: 1,
    overrideAccess: true,
    sort: '-createdAt',
  });

  // Shape into a frontend-friendly format
  const favorites = result.docs.map((doc) => ({
    id: doc.id,
    targetType: doc.targetType,
    targetId:
      doc.targetType === 'bridge'
        ? typeof doc.bridge === 'object'
          ? doc.bridge?.id
          : doc.bridge
        : typeof doc.place === 'object'
          ? doc.place?.id
          : doc.place,
    bridge: doc.targetType === 'bridge' ? doc.bridge : null,
    place: doc.targetType === 'place' ? doc.place : null,
    createdAt: doc.createdAt,
  }));

  return Response.json({ favorites });
}
