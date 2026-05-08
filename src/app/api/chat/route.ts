import Anthropic from '@anthropic-ai/sdk';
import { getPayload } from 'payload';
import config from '@payload-config';
import { z } from 'zod';

import { FALLBACK_BRIDGES, type FallbackBridge } from '@/data/bridges-fallback';
import { FALLBACK_PLACES, type FallbackPlace } from '@/data/places-fallback';

export const runtime = 'nodejs';

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

/**
 * Build the system prompt with live bridge + place data.
 *
 * Falls back to the hardcoded bridge list if Payload is empty or unreachable —
 * this matches the behavior of /api/bridges so the AI has something to talk
 * about even in a fresh install.
 */
async function buildSystemPrompt(): Promise<string> {
  let bridgeDocs: FallbackBridge[] = [];
  let placeDocs: FallbackPlace[] = [];

  try {
    const payload = await getPayload({ config });
    const [bridgeResult, placeResult] = await Promise.all([
      payload.find({
        collection: 'bridges',
        limit: 100,
      }),
      payload.find({
        collection: 'places',
        limit: 200,
      }),
    ]);

    bridgeDocs =
      bridgeResult.docs.length > 0
        ? (bridgeResult.docs.map(normalizeBridge) as FallbackBridge[])
        : FALLBACK_BRIDGES;
    placeDocs =
      placeResult.docs.length > 0
        ? (placeResult.docs.map(normalizePlace) as FallbackPlace[])
        : FALLBACK_PLACES;
  } catch (err) {
    console.error('[chat] Payload query failed, using fallback:', err);
    bridgeDocs = FALLBACK_BRIDGES;
    placeDocs = FALLBACK_PLACES;
  }

  const bridgeList = bridgeDocs
    .map((b) => {
      const status = b.status === 'restored' ? 'OPEN' : 'view-only';
      const community = b.location.nearestCommunity || 'Clay County';
      return `- ${b.name} [${status}, ${community}]: ${b.shortDescription}`;
    })
    .join('\n');

  // Group places by their high-level audience filter so the AI can reason
  // about "where to eat" vs "where to stay" vs "what to do" easily.
  const placeGroups: Record<'eat' | 'stay' | 'do', FallbackPlace[]> = {
    eat: [],
    stay: [],
    do: [],
  };
  for (const p of placeDocs) {
    if (p.placeType === 'restaurant') placeGroups.eat.push(p);
    else if (['hotel', 'rental', 'campground'].includes(p.placeType)) placeGroups.stay.push(p);
    else placeGroups.do.push(p);
  }

  function formatPlaceList(list: FallbackPlace[]): string {
    if (list.length === 0) return '(none yet)';
    return list
      .map((p) => {
        const community = p.location.community || 'Clay County';
        const phone = p.contact?.phone ? ` · ${p.contact.phone}` : '';
        return `- ${p.name} [${p.placeType}, ${community}${phone}]: ${p.shortDescription}`;
      })
      .join('\n');
  }

  return `You are a friendly local tour guide for Clay County, Kentucky — known as the "Land of Swinging Bridges." Visitors come here to walk historic suspension footbridges that span rural creeks and rivers, and you help them plan day trips that combine bridge visits with food, lodging, and attractions.

# Your voice
- Warm and a little folksy, like an experienced local greeting visitors at the courthouse square in Manchester. Don't be saccharine — be genuine.
- Direct and useful. When asked for a plan, give a plan with specific stops and rough timing. Don't hedge with "you might consider..."
- Knowledgeable about local geography and the names of the bridges, the waterways (Goose Creek, Red Bird, South Fork of the Kentucky), and the small communities (Manchester, Oneida, Big Creek).

# Format your responses with markdown
- Use **bold** for bridge names and place names on first mention.
- Use bullet lists for multi-stop plans and short groups.
- Use \`## Headers\` to break up multi-section answers (e.g., "## Morning" / "## Afternoon" for day plans).
- Keep paragraphs short — this is a mobile app, not a desktop email.

# Always include in trip plans
- Specific bridge names from the list below
- Rough drive times (Clay County roads are slow — figure 25-35 mph average on the back roads)
- A safety note for restored bridges: max 4 people / 800 lbs, no bouncing or jumping
- A respectful note that bridge ends may sit on private property — ask visitors not to litter

# Restored bridges (open to walk) and photograph-only bridges
${bridgeList}

# Where to eat
${formatPlaceList(placeGroups.eat)}

# Where to stay
${formatPlaceList(placeGroups.stay)}

# Things to do (museums, parks, trails, golf, attractions)
${formatPlaceList(placeGroups.do)}

# Hard rules
- Never invent bridges, restaurants, hotels, or addresses that aren't in the lists above. If asked about something you don't have data on, say so plainly and offer what you DO know.
- If asked about driving directions in detail, refer the visitor to the bridge's detail page in the app — they can tap "Directions" to launch their phone's maps.
- If a question is unrelated to Clay County tourism (politics, math homework, etc.), politely redirect: you're here to help plan their visit.`;
}

function normalizePlace(doc: Record<string, unknown>): FallbackPlace {
  const loc = (doc.location as Record<string, unknown>) || {};
  const contact = (doc.contact as Record<string, unknown>) || {};
  return {
    slug: doc.slug as string,
    name: doc.name as string,
    placeType: (doc.placeType as FallbackPlace['placeType']) || 'attraction',
    shortDescription: (doc.shortDescription as string) || '',
    description: typeof doc.description === 'string' ? doc.description : '',
    location: {
      latitude: (loc.latitude as number) || 0,
      longitude: (loc.longitude as number) || 0,
      address: loc.address as string | undefined,
      community: loc.community as string | undefined,
    },
    contact: Object.keys(contact).length
      ? {
          phone: contact.phone as string | undefined,
          website: contact.website as string | undefined,
          email: contact.email as string | undefined,
          bookingUrl: contact.bookingUrl as string | undefined,
        }
      : undefined,
    priceRange: doc.priceRange as FallbackPlace['priceRange'],
    featured: doc.featured as boolean | undefined,
    coordinatesVerified: true,
  };
}

function normalizeBridge(doc: Record<string, unknown>): FallbackBridge {
  const loc = (doc.location as Record<string, unknown>) || {};
  return {
    slug: doc.slug as string,
    name: doc.name as string,
    alternateName: doc.alternateName as string | undefined,
    status: (doc.status as FallbackBridge['status']) || 'restored',
    shortDescription: (doc.shortDescription as string) || '',
    description: '',
    location: {
      latitude: (loc.latitude as number) || 0,
      longitude: (loc.longitude as number) || 0,
      waterway: loc.waterway as FallbackBridge['location']['waterway'],
      nearestCommunity: loc.nearestCommunity as string | undefined,
    },
    coordinatesVerified: true,
  };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'AI is not configured on this server. Set ANTHROPIC_API_KEY.' },
        { status: 503 },
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const system = await buildSystemPrompt();

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system,
      messages: parsed.data.messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no', // disable proxy buffering for streaming
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[chat] Internal error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
