import { getPayload } from 'payload';
import config from '@payload-config';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const payload = await getPayload({ config });

  try {
    const doc = await payload.findByID({
      collection: 'itineraries',
      id,
      depth: 2, // expand bridge/place inside stops
      overrideAccess: true,
    });

    // Enforce ownership at the application layer too (belt and suspenders)
    const ownerId = typeof doc.user === 'object' ? doc.user?.id : doc.user;
    if (ownerId !== user.id && !doc.isPublic && user.role !== 'admin') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json({ itinerary: doc });
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const payload = await getPayload({ config });

  try {
    const doc = await payload.findByID({
      collection: 'itineraries',
      id,
      depth: 0,
      overrideAccess: true,
    });
    const ownerId = typeof doc.user === 'object' ? doc.user?.id : doc.user;
    if (ownerId !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await payload.delete({
      collection: 'itineraries',
      id,
      overrideAccess: true,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
