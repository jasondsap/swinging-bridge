import { getPayload } from 'payload';
import config from '@payload-config';

import {
  FALLBACK_BRIDGES,
  sortBridgesForDisplay,
  type FallbackBridge,
} from '@/data/bridges-fallback';

export const runtime = 'nodejs';

/**
 * GET /api/bridges
 *
 * Returns all published bridges. Prefers data from the Payload CMS;
 * falls back to the hardcoded list in src/data/bridges-fallback.ts
 * if the CMS has no entries (or if Payload is not yet reachable).
 *
 * The fallback exists so the app always has *something* to show — fresh
 * installs, dev environments without seed data, and accidental DB wipes
 * all degrade gracefully instead of blanking the screen.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: 'bridges',
      limit: 100,
      depth: 1, // include hero image media
      sort: 'createdAt', // stable base order; display sort runs on top
    });

    if (result.docs.length > 0) {
      return Response.json({
        source: 'cms',
        bridges: sortBridgesForDisplay(result.docs.map(normalizeCmsBridge)),
      });
    }

    // CMS is empty → use the fallback
    return Response.json({
      source: 'fallback',
      bridges: sortBridgesForDisplay(FALLBACK_BRIDGES),
    });
  } catch (err) {
    // Payload itself failed (DB down, missing env, etc.) — never let
    // the user see a blank app. Serve the fallback and log the error.
    console.error('[api/bridges] Payload query failed, serving fallback:', err);
    return Response.json({
      source: 'fallback-error',
      bridges: sortBridgesForDisplay(FALLBACK_BRIDGES),
    });
  }
}

/**
 * Normalize a Payload CMS bridge document into the same shape as
 * `FallbackBridge`, so the frontend doesn't have to branch on the source.
 */
function normalizeCmsBridge(doc: Record<string, unknown>): FallbackBridge {
  const loc = (doc.location as Record<string, unknown>) || {};
  const specs = (doc.specs as Record<string, unknown>) || {};
  return {
    slug: doc.slug as string,
    name: doc.name as string,
    alternateName: doc.alternateName as string | undefined,
    status: (doc.status as FallbackBridge['status']) || 'restored',
    shortDescription: (doc.shortDescription as string) || '',
    description: typeof doc.description === 'string' ? doc.description : '',
    location: {
      latitude: (loc.latitude as number) || 0,
      longitude: (loc.longitude as number) || 0,
      waterway: loc.waterway as FallbackBridge['location']['waterway'],
      nearestCommunity: loc.nearestCommunity as string | undefined,
      directions: loc.directions as string | undefined,
    },
    specs: Object.keys(specs).length
      ? {
          lengthFeet: specs.lengthFeet as number | undefined,
          yearBuilt: specs.yearBuilt as number | undefined,
          maxOccupants: specs.maxOccupants as number | undefined,
          maxWeightPounds: specs.maxWeightPounds as number | undefined,
        }
      : undefined,
    tags: (doc.tags as string[]) || [],
    coordinatesVerified: true, // CMS data is assumed verified
  };
}
