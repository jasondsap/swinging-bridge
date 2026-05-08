import { getPayload } from 'payload';
import config from '@payload-config';
import { z } from 'zod';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

const requestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  narrative: z.string().min(1).max(20000),
});

/**
 * Save an AI-generated trip plan as an itinerary.
 *
 * For v1 we store the full markdown narrative without parsing it into
 * structured stops — the trip detail page renders the markdown directly.
 * Structured stops can be added in a follow-up that has the AI output
 * JSON alongside its prose response.
 */
export async function POST(req: Request) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const payload = await getPayload({ config });

  const created = await payload.create({
    collection: 'itineraries',
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      narrative: parsed.data.narrative,
      user: user.id,
      source: 'ai',
      isPublic: false,
    },
    overrideAccess: true,
  });

  return Response.json({ id: created.id, title: created.title });
}
