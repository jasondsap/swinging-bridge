/**
 * Fallback bridge data.
 *
 * Used when the Payload CMS has no bridges yet (fresh install, dev with empty
 * DB, or as a safety net in production). The /api/bridges endpoint prefers
 * CMS data and only falls back to this file if the CMS returns zero results.
 *
 * Coordinates here are GEOCODED FROM THE PRINTED DIRECTIONS — they're rough
 * (within ~0.25–0.5 mi). The non-profit should ground-truth them by visiting
 * each bridge with a phone and pinning the exact location. When they update
 * the CMS, those values automatically take precedence over this file.
 *
 * Source: Clay County Community Guide 2026 — "Just'a Swingin'" pages.
 */

export type BridgeStatus = 'restored' | 'photograph_only' | 'closed';

export interface FallbackBridge {
  slug: string;
  name: string;
  alternateName?: string;
  status: BridgeStatus;
  shortDescription: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    waterway?: 'goose_creek' | 'red_bird' | 'south_fork' | 'other';
    nearestCommunity?: string;
    directions?: string;
  };
  specs?: {
    lengthFeet?: number;
    yearBuilt?: number;
    maxOccupants?: number;
    maxWeightPounds?: number;
  };
  tags?: string[];
  coordinatesVerified: boolean;
}

export const FALLBACK_BRIDGES: FallbackBridge[] = [
  // ─── RESTORED — SAFE TO CROSS ─────────────────────────────────────
  {
    slug: 'jockey-street',
    name: 'Jockey Street Bridge',
    alternateName: 'The Bridge to our Future',
    status: 'restored',
    shortDescription:
      "Spans Goose Creek in the heart of downtown Manchester. The most accessible of all Clay County's swinging bridges.",
    description:
      "Jockey Street Bridge stands at the eastern end of Bridge Street in downtown Manchester, where the road meets the water. Locally known as 'The Bridge to our Future,' it's the easiest of the seven restored bridges to visit — you can park near the courthouse and walk right to it. From the east end, a short trail leads south along the River Walk to the Goose Creek Salt Works Village, the most historic site in Clay County.",
    location: {
      latitude: 37.1535,
      longitude: -83.759,
      waterway: 'goose_creek',
      nearestCommunity: 'Manchester',
      directions:
        'From Clay County Police Department / 911 Dispatch on the Square in downtown Manchester, turn east onto Bridge Street. The street ends at the swinging bridge.',
    },
    tags: ['family_friendly', 'easy_access', 'historic'],
    coordinatesVerified: false,
  },
  {
    slug: 'frazier-road',
    name: 'Frazier Road Bridge',
    status: 'restored',
    shortDescription:
      'Tucked away on Frazier Road off KY 11 — a quiet crossing surrounded by Appalachian woods.',
    description:
      "A peaceful, secluded bridge reached by a country drive. Frazier Road forks shortly before the bridge — stay right at the fork, and you'll find the bridge on the left. The setting is classic rural Kentucky: tall hardwoods, a working creek, and almost no foot traffic.",
    location: {
      latitude: 37.234,
      longitude: -83.708,
      nearestCommunity: 'Manchester',
      directions:
        'Turn north onto US 421 and travel six miles. Turn right onto KY 11 and travel 4 miles. Turn right onto Frazier Road. As the road forks, stay right. The bridge will be on the left.',
    },
    tags: ['scenic'],
    coordinatesVerified: false,
  },
  {
    slug: 'old-homeplace',
    name: 'Old Homeplace Bridge',
    status: 'restored',
    shortDescription:
      'A roadside bridge along KY 11 — perfect for a quick stop on the way to Oneida.',
    description:
      "An accessible bridge right off the highway. Old Homeplace gets its name from the family farmsteads that once dotted this stretch of KY 11. Easy to spot from the road and easy to park near — a great first stop on a multi-bridge day trip.",
    location: {
      latitude: 37.27,
      longitude: -83.667,
      nearestCommunity: 'Manchester',
      directions:
        'Turn north onto US 421 and travel six miles. Turn right onto KY 11 and travel 10 miles. The bridge will be on the right.',
    },
    tags: ['easy_access', 'family_friendly'],
    coordinatesVerified: false,
  },
  {
    slug: 'oneida-baptist-institute',
    name: 'Oneida Baptist Institute Bridge',
    status: 'restored',
    shortDescription:
      'A historic crossing in the heart of Oneida, near the Oneida Baptist Institute campus.',
    description:
      "This bridge sits in the small mountain community of Oneida, alongside the campus of the Oneida Baptist Institute — a boarding school founded in 1899 that has anchored the community for over a century. The drive in passes a series of bends, country churches, and roadside gardens.",
    location: {
      latitude: 37.276,
      longitude: -83.645,
      nearestCommunity: 'Oneida',
      directions:
        'Turn north onto US 421 and travel six miles. Turn right onto KY 11 and travel 11 miles to the community of Oneida. Continue straight onto KY 66 and travel .7 miles. Turn right onto 2nd Street and travel .5 miles. Turn right onto Barkley Moore Road and travel .2 miles. Turn right and the bridge will be on the right.',
    },
    tags: ['historic', 'family_friendly'],
    coordinatesVerified: false,
  },
  {
    slug: 'rocky-branch',
    name: 'Rocky Branch Bridge',
    status: 'restored',
    shortDescription:
      "Clay County's newest and longest swinging bridge — about 200 feet across the South Fork of the Kentucky River.",
    description:
      "The crown jewel of the restoration program. At roughly 200 feet long, Rocky Branch is the longest swinging bridge in Clay County and spans the South Fork of the Kentucky River. The drive in along Rocky Branch Road is part of the experience — narrow, twisting, and beautifully wooded.",
    location: {
      latitude: 37.345,
      longitude: -83.658,
      waterway: 'south_fork',
      nearestCommunity: 'Booneville (north of Oneida)',
      directions:
        'Turn north onto US 421 and travel six miles. Turn right onto KY 11 and travel 11 miles to the community of Oneida. Turn left and continue on KY 11 north toward Booneville. Travel approximately 5 miles to Rocky Branch Road. Turn right and travel 2 miles to the bridge.',
    },
    specs: {
      lengthFeet: 200,
      maxOccupants: 4,
      maxWeightPounds: 800,
    },
    tags: ['longest', 'scenic', 'historic'],
    coordinatesVerified: false,
  },
  {
    slug: 'antepast',
    name: 'Antepast Bridge',
    status: 'restored',
    shortDescription:
      "Clay County's tallest swinging bridge, with a steep ramp up to the deck and a dramatic view of the Red Bird River.",
    description:
      "The most dramatic of the restored bridges — Antepast crosses the Red Bird River and is the tallest swinging bridge in the county. The ramp up to the deck is steep, and the views down to the water are spectacular. Park at Antepast Church (the bridge sits at the back of the parking lot). Note that KY 66 makes a sharp right turn after the .8 mile mark — don't miss it.",
    location: {
      latitude: 37.265,
      longitude: -83.56,
      waterway: 'red_bird',
      nearestCommunity: 'Oneida',
      directions:
        'Turn north onto US 421 and travel six miles. Turn right onto KY 11 and travel 11 miles to the community of Oneida. Continue straight onto KY 66 and travel approximately 5.5 miles to Antepast Church (Note: After .8 miles KY 66 makes a sharp turn to the right). Church is on the right and the bridge is at the back of the parking lot.',
    },
    tags: ['tallest', 'scenic', 'historic'],
    coordinatesVerified: false,
  },
  {
    slug: 'farmer-road',
    name: 'Farmer Road Bridge',
    status: 'restored',
    shortDescription:
      'A long drive but worth it — a quiet bridge in the Big Creek area, accessed via the Hal Rogers Parkway.',
    description:
      "The most remote of the restored seven, but reached by a beautiful drive on the Hal Rogers Parkway through the eastern reaches of the county. After exiting at Big Creek, a series of country-road turns leads you to the bridge — a peaceful crossing with almost no other visitors.",
    location: {
      latitude: 37.205,
      longitude: -83.43,
      nearestCommunity: 'Big Creek',
      directions:
        'Turn south onto US 421 and travel approximately 1.4 miles to the Hal Rogers Parkway. Travel east on the Hal Rogers Parkway toward Hazard for approximately 13 miles. Turn left at Exit 34 (Big Creek). Turn right onto KY 66 and travel .5 miles. Turn right onto KY 80 and travel .8 miles. Turn left onto KY 66 and travel 4 miles. The bridge will be on the left.',
    },
    tags: ['scenic'],
    coordinatesVerified: false,
  },

  // ─── PHOTOGRAPH-ONLY — VIEW FROM A DISTANCE ──────────────────────
  {
    slug: 'barbourville-road',
    name: 'Barbourville Road Bridge',
    status: 'photograph_only',
    shortDescription:
      'A historic unrestored bridge along KY 11 near the Clay/Knox County line, by Antioch Church.',
    description:
      "An evocative reminder of how many of these bridges once looked. The Barbourville Road bridge has not been restored and is unsafe to cross, but its silhouette against the Kentucky hills makes for a memorable photograph. View from Antioch Church or the roadside.",
    location: {
      latitude: 37.075,
      longitude: -83.84,
      nearestCommunity: 'Manchester (south, near Knox County line)',
      directions: 'On KY 11 near the Clay/Knox County line, near Antioch Church.',
    },
    tags: ['historic', 'scenic'],
    coordinatesVerified: false,
  },
  {
    slug: 'martin-cemetery-road',
    name: 'Martin Cemetery Road Bridge',
    status: 'photograph_only',
    shortDescription:
      'An unrestored bridge along KY 66, near the Antepast Swinging Bridge — a natural pairing for photographers.',
    description:
      "Often photographed on the same day as Antepast. Martin Cemetery Road sits between Oneida and Big Creek along KY 66 — view from the road. Not safe to cross.",
    location: {
      latitude: 37.26,
      longitude: -83.57,
      nearestCommunity: 'Between Oneida and Big Creek',
      directions: 'On KY 66 between the communities of Oneida and Big Creek. Near the Antepast Swinging Bridge.',
    },
    tags: ['historic', 'scenic'],
    coordinatesVerified: false,
  },
  {
    slug: 'laurel-branch-road',
    name: 'Laurel Branch Road Bridge',
    status: 'photograph_only',
    shortDescription: 'A historic bridge crossing the Red Bird River, off KY 66 between Oneida and Big Creek.',
    description:
      "One of two historic Red Bird River crossings on this list (the other being Antepast). Laurel Branch Road is unrestored — view from the road, do not attempt to cross.",
    location: {
      latitude: 37.225,
      longitude: -83.555,
      waterway: 'red_bird',
      nearestCommunity: 'Between Oneida and Big Creek',
      directions: 'Laurel Branch Road off KY 66 between the communities of Oneida and Big Creek. This bridge crosses the Red Bird River.',
    },
    tags: ['historic'],
    coordinatesVerified: false,
  },
  {
    slug: 'bullskin-creek',
    name: 'Bullskin Creek Bridge',
    status: 'photograph_only',
    shortDescription: 'An unrestored historic bridge on KY 1482, just outside the community of Oneida.',
    description:
      "A short detour from Oneida brings you to Bullskin Creek — an evocative photograph subject, especially in early morning light. Not safe to cross.",
    location: {
      latitude: 37.29,
      longitude: -83.62,
      nearestCommunity: 'Oneida',
      directions: 'On KY 1482 outside the community of Oneida.',
    },
    tags: ['historic'],
    coordinatesVerified: false,
  },
  {
    slug: 'bar-creek-road',
    name: 'Bar Creek Road Bridge',
    status: 'photograph_only',
    shortDescription: 'A historic crossing on KY 66 between Big Creek and Oneida, at Bar Creek Road.',
    description:
      "Another of the unrestored bridges that span KY 66 between Oneida and Big Creek. View from the roadside — do not cross.",
    location: {
      latitude: 37.235,
      longitude: -83.52,
      nearestCommunity: 'Between Big Creek and Oneida',
      directions: 'At Bar Creek Road on KY 66 between the communities of Big Creek and Oneida.',
    },
    tags: ['historic'],
    coordinatesVerified: false,
  },
];

/**
 * Compute the bounding box that contains all bridges — used by the map view
 * to set its initial fit.
 */
export function getBridgesBoundingBox(bridges: FallbackBridge[] = FALLBACK_BRIDGES) {
  const lats = bridges.map((b) => b.location.latitude);
  const lngs = bridges.map((b) => b.location.longitude);
  return {
    south: Math.min(...lats),
    north: Math.max(...lats),
    west: Math.min(...lngs),
    east: Math.max(...lngs),
  };
}
