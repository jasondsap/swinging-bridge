import { getPayload } from 'payload';
import config from '@payload-config';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'itineraries',
    where: { user: { equals: user.id } },
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
    depth: 0,
  });

  const itineraries = result.docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    source: doc.source,
    stopCount: Array.isArray(doc.stops) ? doc.stops.length : 0,
    hasNarrative: Boolean(doc.narrative),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return Response.json({ itineraries });
}
