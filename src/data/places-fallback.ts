/**
 * Fallback place data for Clay County, Kentucky.
 *
 * Used when the Payload CMS is empty (fresh install, dev, or a
 * safety net in production). Sourced from the 2026 Clay County
 * Community Guide.
 *
 * Coordinates are GEOCODED FROM ADDRESSES — they're rough (within
 * ~0.25 mi). The non-profit should ground-truth them by visiting
 * each location with a phone and pinning exact coordinates.
 */

export type PlaceType =
  | 'restaurant'
  | 'hotel'
  | 'rental'
  | 'campground'
  | 'attraction'
  | 'outdoor'
  | 'museum'
  | 'shopping'
  | 'service';

export type PriceRange = 'free' | '1' | '2' | '3' | '4';

export interface FallbackPlace {
  slug: string;
  name: string;
  placeType: PlaceType;
  shortDescription: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    community?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
    bookingUrl?: string;
  };
  hours?: Array<{
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    open?: string;
    close?: string;
    closed?: boolean;
  }>;
  priceRange?: PriceRange;
  /** True for highlighted places — featured in "Don't miss" sections */
  featured?: boolean;
  /** Slugs of bridges within reasonable driving distance — used for cross-linking */
  nearbyBridges?: string[];
  /**
   * Photo uploaded via the CMS, if any. Absent on fallback data and on places
   * without a photo yet — the card draws the SVG placeholder and the detail
   * page omits the hero band. `url` is the 16:9 hero crop; `cardUrl` is the
   * 4:3 card crop.
   */
  heroImage?: {
    url: string;
    cardUrl?: string;
    alt?: string;
  } | null;
  coordinatesVerified: boolean;
}

export const FALLBACK_PLACES: FallbackPlace[] = [
  // ─── EAT ─────────────────────────────────────────────────
  {
    slug: 'pats-snack-bar',
    name: "Pat's Snack Bar",
    placeType: 'restaurant',
    shortDescription:
      'Regionally famous diner — rated #4 best burger in Kentucky in 2021. Operating since 1949.',
    description:
      "Originally a pool hall, Pat's Snack Bar has been serving up burgers and short-order classics since 1949. The kind of place where the booths haven't moved in decades and locals greet you by name. Park downtown after walking the Jockey Street Swinging Bridge and grab a bite — you can't visit Manchester without stopping in.",
    location: {
      latitude: 37.151,
      longitude: -83.762,
      address: '112 Town Branch Rd., Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 599-0199' },
    priceRange: '1',
    featured: true,
    nearbyBridges: ['jockey-street'],
    coordinatesVerified: false,
  },
  {
    slug: 'mi-costa',
    name: 'Mi Costa Mexican Restaurant',
    placeType: 'restaurant',
    shortDescription:
      'Family-owned Mexican restaurant with a generous menu and even more generous portions.',
    description:
      "A reliable favorite on the south end of US 421, Mi Costa serves traditional Mexican and Tex-Mex with weekly specials. DoorDash available if you'd rather take it back to the campground.",
    location: {
      latitude: 37.135,
      longitude: -83.77,
      address: '2727 South Highway 421, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: {
      phone: '(606) 658-2329',
    },
    hours: [
      { day: 'mon', open: '10:30 AM', close: '10:00 PM' },
      { day: 'tue', open: '10:30 AM', close: '10:00 PM' },
      { day: 'wed', open: '10:30 AM', close: '10:00 PM' },
      { day: 'thu', open: '10:30 AM', close: '10:00 PM' },
      { day: 'fri', open: '10:30 AM', close: '10:30 PM' },
      { day: 'sat', open: '10:30 AM', close: '10:30 PM' },
      { day: 'sun', open: '11:00 AM', close: '9:30 PM' },
    ],
    priceRange: '2',
    featured: true,
    coordinatesVerified: false,
  },
  {
    slug: 'mennonite-bakery',
    name: 'Mennonite Bakery',
    placeType: 'restaurant',
    shortDescription:
      'A local favorite for more than thirty years — freshly glazed doughnuts, pecan rings, and homemade pastries.',
    description:
      "If your day starts with breakfast, start it here. The Mennonite Bakery has been a local landmark for over three decades, and locals still line up for the freshly glazed doughnuts and pecan rings. Cash-friendly, traditionally simple, completely worth it.",
    location: {
      latitude: 37.155,
      longitude: -83.764,
      community: 'Manchester',
    },
    priceRange: '1',
    featured: true,
    nearbyBridges: ['jockey-street'],
    coordinatesVerified: false,
  },
  {
    slug: 'el-dorados',
    name: 'El Dorados',
    placeType: 'restaurant',
    shortDescription: 'Mexican fare in the heart of Manchester Square.',
    description:
      'Casual Mexican spot anchoring Manchester Square — a quick lunch stop between sightseeing.',
    location: {
      latitude: 37.153,
      longitude: -83.76,
      address: '376 Manchester Square, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 599-9178' },
    priceRange: '2',
    coordinatesVerified: false,
  },
  {
    slug: 'huddle-house',
    name: 'Huddle House',
    placeType: 'restaurant',
    shortDescription: '24-hour Southern diner classics off Highway 80.',
    description:
      'Reliable American diner food — biscuits, gravy, all-day breakfast — handy when you roll into town late.',
    location: {
      latitude: 37.15,
      longitude: -83.745,
      address: '415 Highway 80, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 598-0109' },
    priceRange: '1',
    coordinatesVerified: false,
  },
  {
    slug: 'local-crows-nest',
    name: "Local Crow's Nest",
    placeType: 'restaurant',
    shortDescription: 'Local hangout on Anderson Street — a downtown standby.',
    description: 'A homegrown spot that locals know. Walk-in friendly.',
    location: {
      latitude: 37.151,
      longitude: -83.76,
      address: 'Anderson St., Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 391-6254' },
    priceRange: '2',
    coordinatesVerified: false,
  },
  {
    slug: 'pizza-pro',
    name: 'Pizza Pro',
    placeType: 'restaurant',
    shortDescription: 'Local pizzeria on Richmond Road.',
    description: 'Hand-tossed pizza, calzones, and wings — a Manchester staple.',
    location: {
      latitude: 37.15,
      longitude: -83.755,
      address: '129 Richmond Rd., Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 598-8907' },
    priceRange: '2',
    coordinatesVerified: false,
  },

  // ─── STAY ────────────────────────────────────────────────
  {
    slug: 'heritage-inn-suites',
    name: 'Heritage Inn & Suites Manchester',
    placeType: 'hotel',
    shortDescription:
      'The hotel option for visitors to Manchester — modern rooms, indoor pool with spa, free breakfast.',
    description:
      "Conveniently located just off the Hal Rogers Parkway, the Heritage Inn features modern, spacious rooms with comfortable beds, free Wi-Fi, and a friendly staff. Room amenities include a microwave, refrigerator, coffee maker, hairdryer, and free complimentary breakfast. The hotel offers an indoor pool with spa tub, business center, and meeting rooms. Laundry service is available, pets are welcome, and parking is free.",
    location: {
      latitude: 37.149,
      longitude: -83.73,
      address: '363 Highway 80, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 598-1800' },
    priceRange: '2',
    featured: true,
    coordinatesVerified: false,
  },
  {
    slug: 'governors-campground',
    name: "Governor's Campground",
    placeType: 'campground',
    shortDescription:
      "City-operated campground 4 miles from downtown, near Bert T. Combs Lake. Named for Kentucky Governor Bert T. Combs.",
    description:
      "Operated by the City of Manchester and named in honor of Kentucky Governor Bert T. Combs — a native of Clay County. Approximately four miles from downtown on Beech Creek Road, the campground lies in an area of incredible beauty near Bert T. Combs Lake — a great place to cast your line.\n\nThe campground offers 24 full hookups (water/electricity/sewer) at $30 per night, or sites with water/electricity at $25 per night.",
    location: {
      latitude: 37.14,
      longitude: -83.7,
      address: 'Beech Creek Road, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: { phone: '(606) 598-1554' },
    priceRange: '1',
    featured: true,
    coordinatesVerified: false,
  },
  {
    slug: 'cross-mountain-campground',
    name: 'Cross Mountain Campground',
    placeType: 'campground',
    shortDescription:
      'Family-friendly mountaintop campground 1.5 miles outside Manchester. Eight miles of hiking trails and a spectacular ridge view.',
    description:
      "Sitting atop Miracle Mountain just 1.5 miles outside Manchester, Cross Mountain offers spectacular views and eight miles of hiking trails. Visitors can also enjoy the community firepit, basketball and pickleball courts, and bath house. All 25 full hookup (water/electricity/sewer) sites sit on concrete pads. Primitive sites are also available.",
    location: {
      latitude: 37.165,
      longitude: -83.775,
      address: '760 Miracle Mountain Road, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: {
      phone: '(606) 813-0990',
      website: 'https://ioadventures.com',
      bookingUrl: 'https://ioadventures.com',
    },
    priceRange: '1',
    coordinatesVerified: false,
  },
  {
    slug: 'ponderosa-pines',
    name: 'Ponderosa Pines',
    placeType: 'campground',
    shortDescription:
      'Music venue and campground hidden in a hollow on Horse Creek. 70 camping sites and lodge rooms; hosts SASS shooting championships and concerts.',
    description:
      "Hidden deep in a hollow on the waters of Horse Creek lies Ponderosa Pines — a unique event attraction unlike any you've been to. Located on the former site of a coal mine, the venue is surrounded by lush grasses and pine trees highlighted by a large pond.\n\nThe Pines hosts the SASS Kentucky State Championship in April and the Black/Gold Shootout in July, drawing visitors from nearly all 50 states. Throughout the summer, Ponderosa Pines hosts various concerts for packed crowds. Lodging is available with 70 camping sites, camper hookups, and several lodge rooms for rent.",
    location: {
      latitude: 37.08,
      longitude: -83.7,
      community: 'Horse Creek',
    },
    contact: { website: 'https://ponderosa-pines.com' },
    priceRange: '1',
    coordinatesVerified: false,
  },
  {
    slug: 'airbnbs-manchester',
    name: 'Airbnb Rentals — Manchester Area',
    placeType: 'rental',
    shortDescription:
      'More than 20 short-term rentals across Clay County — downtown stays, trailhead cabins, and ATV-friendly properties.',
    description:
      "Clay County hosts more than 20 Airbnb rentals to choose from. Create your own local experience by choosing to stay within the downtown area, near a trailhead for easy access, or in a cabin on the waters of the South Fork of the Kentucky River. Several rentals are tailored to ATV enthusiasts.\n\nFor specific listings and to book, visit Airbnb directly.",
    location: {
      latitude: 37.153,
      longitude: -83.762,
      community: 'Manchester area (multiple locations)',
    },
    contact: {
      bookingUrl: 'https://www.airbnb.com/s/Manchester--Kentucky',
      website: 'https://www.airbnb.com/s/Manchester--Kentucky',
    },
    priceRange: '2',
    coordinatesVerified: false,
  },

  // ─── SEE & DO ─────────────────────────────────────────────
  {
    slug: 'rawlings-stinson-park',
    name: 'Rawlings & Stinson Park',
    placeType: 'outdoor',
    shortDescription:
      'Picturesque park along Goose Creek with shelters, walking track, kayak access, and the start of the River Trail to the swinging bridge.',
    description:
      "Sitting along Goose Creek just outside the downtown area, Rawlings & Stinson Park is one of Manchester's gems. The park has several covered shelters with tables and grills, a covered concert stage, mini playground areas, a gazebo, and a large lawn for outdoor games. A memorial honors Clay County's military veterans, and a Red Bird Petroglyphs exhibit displays the region's pre-Columbian heritage.\n\nA state-of-the-art rubber walking track encircles the park. For a longer hike, the connecting River Trail follows Goose Creek for 1½ scenic miles — passing the Goose Creek Swinging Bridge, Riverside Park, and ending at the Goose Creek Salt Works Village. A concrete boat ramp gives direct access for fishing, canoeing, and kayaking.",
    location: {
      latitude: 37.152,
      longitude: -83.755,
      community: 'Manchester',
    },
    priceRange: 'free',
    featured: true,
    nearbyBridges: ['jockey-street'],
    coordinatesVerified: false,
  },
  {
    slug: 'goose-creek-salt-works-village',
    name: 'Goose Creek Salt Works Village',
    placeType: 'attraction',
    shortDescription:
      "Recreation of Clay County's most historic site — the first salt works on Goose Creek and the seat of the first county government in 1807.",
    description:
      "The most historic site in Clay County — a recreation of the first salt works on Goose Creek and the location of the first county government in 1807. Reachable by car, or by an easy half-mile hike south along the River Walk from the east end of the Jockey Street Swinging Bridge. Pair it with a stop at Pat's Snack Bar back in town for the full local experience.",
    location: {
      latitude: 37.148,
      longitude: -83.752,
      community: 'East Manchester',
    },
    priceRange: 'free',
    featured: true,
    nearbyBridges: ['jockey-street'],
    coordinatesVerified: false,
  },
  {
    slug: 'clay-we-were-museum',
    name: 'Clay We Were Museum',
    placeType: 'museum',
    shortDescription:
      'Award-winning local history museum on Main Street — a "small town museum with a big city feel."',
    description:
      "Located inside the Clay County Historical Society on Main Street. The Clay We Were Museum is open to the public on Thursdays and Fridays, 9 am–3 pm, with admission free. To visit on another day, call ahead or email for an appointment. Books about local history and \"Where You From?\" t-shirts available in the museum store.",
    location: {
      latitude: 37.153,
      longitude: -83.76,
      address: '202 Main Street, Manchester, KY 40962',
      community: 'Manchester',
    },
    contact: {
      phone: '(606) 391-6643',
      email: 'ccgnhs@gmail.org',
      website: 'https://clayfamilies.org',
    },
    hours: [
      { day: 'mon', closed: true },
      { day: 'tue', closed: true },
      { day: 'wed', closed: true },
      { day: 'thu', open: '9:00 AM', close: '3:00 PM' },
      { day: 'fri', open: '9:00 AM', close: '3:00 PM' },
      { day: 'sat', closed: true },
      { day: 'sun', closed: true },
    ],
    priceRange: 'free',
    featured: true,
    coordinatesVerified: false,
  },
  {
    slug: 'legends-hall',
    name: 'Legends Hall Basketball Museum',
    placeType: 'museum',
    shortDescription:
      'The only school-affiliated basketball museum in Kentucky — celebrating Clay County Tigers and Lady Tigers.',
    description:
      "Clay County is the only school in Kentucky with over 2,000 wins in boys' basketball and over 1,000 wins in girls' basketball. Legends Hall, created by the Clay Board of Education in collaboration with the Clay County Historical Society, is the only school-affiliated basketball museum in the state. A unique stop for sports fans and basketball history buffs.",
    location: {
      latitude: 37.165,
      longitude: -83.745,
      community: 'Manchester',
    },
    contact: { website: 'https://www.facebook.com/' },
    priceRange: 'free',
    coordinatesVerified: false,
  },
  {
    slug: 'history-pavilion',
    name: 'History Pavilion on the Square',
    placeType: 'attraction',
    shortDescription:
      'Open-air pavilion in downtown Manchester telling the story of the Civil War in Clay County and the people who shaped it.',
    description:
      "Standing at the heart of downtown Manchester, the History Pavilion is part of the city's downtown historic walk. Read panels about Clay County's role in the Civil War and the prominent people who shaped the county. Pair it with a walk past the giant History Banners at six historic sites along Main Street — each banner has a QR code with more information.",
    location: {
      latitude: 37.153,
      longitude: -83.762,
      community: 'Downtown Manchester',
    },
    priceRange: 'free',
    coordinatesVerified: false,
  },
  {
    slug: 'big-hickory-golf-course',
    name: 'Big Hickory Golf Course',
    placeType: 'outdoor',
    shortDescription: 'Nine-hole golf course in Manchester.',
    description:
      'A friendly nine-hole course — a relaxed round in the foothills of the Daniel Boone National Forest.',
    location: {
      latitude: 37.18,
      longitude: -83.75,
      community: 'Manchester',
    },
    priceRange: '2',
    coordinatesVerified: false,
  },
  {
    slug: 'elk-mountain-recreational-area',
    name: 'Elk Mountain Recreational Area',
    placeType: 'outdoor',
    shortDescription:
      'Over 1,000 acres of woodland 7 miles outside Manchester — a centerpiece of the Clay County Off-Road trail network.',
    description:
      "Home to Clay County Off-Road's Spring and Fall Festivals, Elk Mountain spans more than 1,000 acres of unforgettable woodlands. Features include a covered shelter, restrooms, and primitive camping (with a full campground coming soon). Watch for elk herds on your way in — sightings are common.",
    location: {
      latitude: 37.08,
      longitude: -83.73,
      community: 'Manchester area (7 miles east)',
    },
    contact: {
      website: 'https://www.facebook.com/',
    },
    priceRange: '1',
    coordinatesVerified: false,
  },
  {
    slug: 'y-hollow-trailhead',
    name: 'Y-Hollow Trailhead',
    placeType: 'outdoor',
    shortDescription:
      "Over 400 acres of access to Clay County's trail network — river, hiking/biking, horse, and ATV trails all from one starting point.",
    description:
      'The Y-Hollow Trailhead begins within the City of Manchester, near the Goose Creek Pioneer Village. From here, popular trails reach Beech Creek, Elk Mountain, Newfound, and the Red Bird trail system. A great starting point for a multi-trail day.',
    location: {
      latitude: 37.151,
      longitude: -83.758,
      community: 'Manchester',
    },
    priceRange: 'free',
    nearbyBridges: ['jockey-street'],
    coordinatesVerified: false,
  },
  {
    slug: 'bert-t-combs-lake',
    name: 'Bert T. Combs Lake',
    placeType: 'outdoor',
    shortDescription:
      '34-acre lake east of Manchester — trout, channel catfish, bass, crappie, and bluegill.',
    description:
      'The 34-acre Bert T. Combs Lake on Hwy 3432 (Beech Creek Road) east of Manchester is one of the best small-water fishing spots in the region. Adjacent to the Burchell-Beech Creek Wildlife Management Area, a 5-mile road follows the ridgeline of the watershed. Stop at the Kentucky Department of Fish & Wildlife site for ramp access.',
    location: {
      latitude: 37.14,
      longitude: -83.69,
      address: 'Beech Creek Road (Hwy 3432), Manchester, KY 40962',
      community: 'East of Manchester',
    },
    priceRange: 'free',
    coordinatesVerified: false,
  },
  {
    slug: 'redbird-district-ranger-office',
    name: 'Redbird District Ranger Office',
    placeType: 'attraction',
    shortDescription:
      'Historic 1920s building constructed by Fordson Coal (a branch of Ford Motor Co.). On the National Register of Historic Places.',
    description:
      "Built in the early 1920s by the Fordson Coal Company — a branch of the Ford Motor Company — this striking building was used as housing for survey crews, engineers, and draftsmen. Crafted by local woodworkers and stonemasons, it features handmade wall paneling in walnut, oak, maple, and American chestnut. The sandstone foundation and interior fireplaces were hand-cut from nearby sources.\n\nThe land was sold to the US Forest Service as part of the Red Bird Purchase Unit in 1967, and the building became the Redbird District Ranger Office. It's now on the National Register of Historic Places.",
    location: {
      latitude: 37.205,
      longitude: -83.43,
      community: 'Far eastern Clay County',
    },
    priceRange: 'free',
    nearbyBridges: ['farmer-road'],
    coordinatesVerified: false,
  },
  {
    slug: 'big-double-picnic-area',
    name: 'Big Double Picnic Area',
    placeType: 'outdoor',
    shortDescription:
      'Scenic picnic spot in the Daniel Boone National Forest — open April through October, 6 am to 10 pm.',
    description:
      'A scenic and popular site for small picnics or large family gatherings, the Big Double Picnic Area is open from 6 am until 10 pm, April through October. Each picnic site includes a grill and picnic table. There are no developed trails, but the area has lots of room to explore — including two nearby fields suitable for sports or other outdoor activities.\n\nDirections: Take KY 66 south from the Big Creek interchange with the Hal Rogers Parkway for 3 miles. Turn onto Forest Service Road 1501 (first right past the Redbird District Office). Follow the signs for 2 miles along Big Double Creek.',
    location: {
      latitude: 37.175,
      longitude: -83.425,
      community: 'Daniel Boone National Forest',
    },
    priceRange: 'free',
    nearbyBridges: ['farmer-road'],
    coordinatesVerified: false,
  },
  {
    slug: 'redbird-crest-trail',
    name: 'Redbird Crest Trail',
    placeType: 'outdoor',
    shortDescription:
      'Nearly 100 miles of multi-use trail in the Daniel Boone National Forest. Hikers, horses, mountain bikes, and OHVs all welcome.',
    description:
      "The Redbird Crest Trail provides nearly 100 miles of wooded trails for visitors to enjoy year-round. It's a multiple-use trail — hikers, horses, mountain bikes, and off-highway vehicles are welcome. Some sections are open only to street-legal vehicles or single-track OHVs.\n\nThe trail forms a loop that begins and ends near the historic Redbird District Office, with two inner loops and a connector trail to a private OHV campground. Marked by orange diamond-shaped signs (hence the nickname \"Diamond Trail\"). Three developed trailheads: Bear Creek, Sugar Creek, and Peabody.\n\nOHV permits are required: $15/day or $60 annual. Available at the Redbird District Office or local vendors.",
    location: {
      latitude: 37.143,
      longitude: -83.58,
      community: 'Daniel Boone National Forest',
    },
    priceRange: '1',
    coordinatesVerified: false,
  },
  {
    slug: 'manchester-welcome-center',
    name: 'Manchester Welcome Center & Kayak Launch',
    placeType: 'attraction',
    shortDescription:
      "Manchester's new front door — Welcome Center with information and meeting space, plus a kayak launch for Goose Creek.",
    description:
      "Manchester's newly opened Welcome Center serves as the community's true front door. The facility doubles as an information center and a flexible meeting/event space for tour groups, tourism partners, and community organizations.\n\nAdjacent to the Welcome Center is a newly constructed kayak ramp on Goose Creek — calm, beautiful water that flows through the heart of Manchester. The launch makes it easy to put in for a paddle right downtown.",
    location: {
      latitude: 37.153,
      longitude: -83.76,
      community: 'Downtown Manchester',
    },
    priceRange: 'free',
    nearbyBridges: ['jockey-street'],
    coordinatesVerified: false,
  },
];

/**
 * Group places by their high-level "audience" filter.
 * Used in the directory page's filter chips.
 */
export const PLACE_FILTER_GROUPS = {
  all: 'All',
  eat: 'Eat',
  stay: 'Stay',
  do: 'See & Do',
} as const;

export type PlaceFilterGroup = keyof typeof PLACE_FILTER_GROUPS;

export function getFilterGroup(placeType: PlaceType): Exclude<PlaceFilterGroup, 'all'> {
  switch (placeType) {
    case 'restaurant':
      return 'eat';
    case 'hotel':
    case 'rental':
    case 'campground':
      return 'stay';
    case 'attraction':
    case 'outdoor':
    case 'museum':
    default:
      return 'do';
  }
}
