'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin } from 'lucide-react';

import { PlaceCard } from '@/components/places/PlaceCard';
import {
  FALLBACK_PLACES,
  type FallbackPlace,
  type PlaceFilterGroup,
  PLACE_FILTER_GROUPS,
  getFilterGroup,
} from '@/data/places-fallback';
import { getCurrentPosition } from '@/lib/capacitor';
import { haversineMiles, cn } from '@/lib/utils';

export default function PlacesPage() {
  const searchParams = useSearchParams();
  const initialFilter = readFilterParam(searchParams?.get('filter'));

  const [places, setPlaces] = useState<FallbackPlace[]>(FALLBACK_PLACES);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PlaceFilterGroup>(initialFilter);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetch('/api/places')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.places)) setPlaces(data.places);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visiblePlaces = useMemo(() => {
    const filtered =
      filter === 'all'
        ? places
        : places.filter((p) => getFilterGroup(p.placeType) === filter);

    if (!userLocation) {
      // Featured first, then by name, when no location is set
      return [...filtered].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }

    return [...filtered].sort((a, b) => {
      const da = haversineMiles(userLocation, a.location);
      const db = haversineMiles(userLocation, b.location);
      return da - db;
    });
  }, [places, filter, userLocation]);

  async function handleNearMe() {
    const pos = await getCurrentPosition();
    if (pos) setUserLocation(pos);
  }

  // Counts per filter group for the chip labels
  const groupCounts = useMemo(() => {
    const counts: Record<PlaceFilterGroup, number> = { all: places.length, eat: 0, stay: 0, do: 0 };
    for (const p of places) counts[getFilterGroup(p.placeType)]++;
    return counts;
  }, [places]);

  return (
    <div className="container-app py-6">
      <div className="mb-6">
        <p className="label-meta">Local guide</p>
        <h1
          className="mt-1 font-display text-3xl font-bold leading-tight text-bridge-navy"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Where to <span className="underline-stroke">eat, stay & explore</span>
        </h1>
        <p className="mt-2 text-bridge-ink/75">
          Restaurants, lodging, parks, museums, and trails — everything Clay County has to offer between bridge stops.
        </p>
      </div>

      {/* Controls bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleNearMe}
          className="inline-flex items-center gap-1.5 rounded-full border border-bridge-navy/20 bg-white px-3 py-1.5 font-sans text-sm font-semibold text-bridge-navy shadow-paper hover:bg-bridge-navy/5"
        >
          <MapPin className="h-3.5 w-3.5" />
          {userLocation ? 'Sorted by distance' : 'Near me'}
        </button>

        <div className="ml-auto flex items-center gap-1 rounded-full border border-bridge-stone/30 bg-bridge-parchment p-1 text-xs">
          {(Object.keys(PLACE_FILTER_GROUPS) as PlaceFilterGroup[]).map((key) => (
            <FilterChip
              key={key}
              selected={filter === key}
              onClick={() => setFilter(key)}
              count={groupCounts[key]}
            >
              {PLACE_FILTER_GROUPS[key]}
            </FilterChip>
          ))}
        </div>
      </div>

      {loading && places === FALLBACK_PLACES && (
        <p className="text-sm text-bridge-stone">Loading the latest…</p>
      )}

      {visiblePlaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bridge-stone/30 bg-white/50 px-6 py-10 text-center text-bridge-stone">
          No places match this filter yet.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visiblePlaces.map((place, i) => (
            <li
              key={place.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <PlaceCard
                place={place}
                distanceMi={
                  userLocation ? haversineMiles(userLocation, place.location) : null
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  count,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 font-sans transition-colors',
        selected
          ? 'bg-bridge-navy font-semibold text-white'
          : 'text-bridge-stone hover:text-bridge-ink',
      )}
    >
      {children} <span className="opacity-60">({count})</span>
    </button>
  );
}

/**
 * Allow the home page to deep-link into a filtered list.
 * Both ?filter=eat (preferred) and ?type=restaurant (legacy) are supported.
 */
function readFilterParam(raw: string | null | undefined): PlaceFilterGroup {
  if (!raw) return 'all';
  const lower = raw.toLowerCase();
  if (lower === 'eat' || lower === 'stay' || lower === 'do' || lower === 'all') {
    return lower as PlaceFilterGroup;
  }
  // Legacy: map a placeType to its filter group
  if (['restaurant', 'cafe', 'bakery'].includes(lower)) return 'eat';
  if (['hotel', 'rental', 'campground', 'lodge'].includes(lower)) return 'stay';
  if (['attraction', 'outdoor', 'museum', 'park', 'trail', 'golf'].includes(lower)) return 'do';
  return 'all';
}
