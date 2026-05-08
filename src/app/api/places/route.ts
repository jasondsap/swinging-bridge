import { getPayload } from 'payload';
import config from '@payload-config';

import { FALLBACK_PLACES, type FallbackPlace } from '@/data/places-fallback';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'places',
      limit: 200,
      depth: 1,
    });

    if (result.docs.length > 0) {
      return Response.json({
        source: 'cms',
        places: result.docs.map(normalizeCmsPlace),
      });
    }

    return Response.json({ source: 'fallback', places: FALLBACK_PLACES });
  } catch (err) {
    console.error('[api/places] Payload query failed, serving fallback:', err);
    return Response.json({ source: 'fallback-error', places: FALLBACK_PLACES });
  }
}

function normalizeCmsPlace(doc: Record<string, unknown>): FallbackPlace {
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
    hours: doc.hours as FallbackPlace['hours'],
    priceRange: doc.priceRange as FallbackPlace['priceRange'],
    featured: doc.featured as boolean | undefined,
    coordinatesVerified: true,
  };
}
