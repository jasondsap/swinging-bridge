'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin } from 'lucide-react';

import { BridgeCard } from '@/components/bridges/BridgeCard';
import { ViewToggle } from '@/components/bridges/ViewToggle';
import {
  FALLBACK_BRIDGES,
  sortBridgesForDisplay,
  type FallbackBridge,
} from '@/data/bridges-fallback';
import { getCurrentPosition } from '@/lib/capacitor';
import { haversineMiles } from '@/lib/utils';

// Leaflet must be client-side only — uses window/document
const BridgeMap = dynamic(() => import('@/components/bridges/BridgeMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bridge-parchment">
      <Loader2 className="h-6 w-6 animate-spin text-bridge-stone" />
    </div>
  ),
});

export default function BridgesPage() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [bridges, setBridges] = useState<FallbackBridge[]>(FALLBACK_BRIDGES);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filter, setFilter] = useState<'all' | 'restored' | 'photograph_only'>('all');

  // Fetch from API (which falls back to hardcoded data)
  useEffect(() => {
    fetch('/api/bridges')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.bridges)) setBridges(data.bridges);
      })
      .catch(() => {
        // Already have fallback as initial state — nothing to do
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter + distance-sort
  const visibleBridges = useMemo(() => {
    const filtered = filter === 'all' ? bridges : bridges.filter((b) => b.status === filter);
    if (!userLocation) return sortBridgesForDisplay(filtered);
    return [...filtered].sort((a, b) => {
      const da = haversineMiles(userLocation, a.location);
      const db = haversineMiles(userLocation, b.location);
      return da - db;
    });
  }, [bridges, filter, userLocation]);

  async function handleNearMe() {
    const pos = await getCurrentPosition();
    if (pos) setUserLocation(pos);
  }

  return (
    <div className="container-app py-6">
      {/* Editorial header */}
      <div className="mb-6">
        <p className="label-meta">Clay County Field Guide · Vol. I</p>
        <h1
          className="mt-1 font-display text-3xl font-bold leading-tight text-bridge-navy"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          The <span className="underline-stroke">Swinging Bridges</span>
        </h1>
        <p className="mt-2 text-bridge-ink/75">
          Ten historic crossings — seven restored and open to walk, three preserved as photograph-only relics. All within a day's drive of downtown Manchester.
        </p>
      </div>

      {/* Controls bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ViewToggle view={view} onChange={setView} />

        <button
          type="button"
          onClick={handleNearMe}
          className="inline-flex items-center gap-1.5 rounded-full border border-bridge-navy/20 bg-white px-3 py-1.5 font-sans text-sm font-semibold text-bridge-navy shadow-paper hover:bg-bridge-navy/5"
        >
          <MapPin className="h-3.5 w-3.5" />
          {userLocation ? 'Sorted by distance' : 'Near me'}
        </button>

        <div className="ml-auto flex items-center gap-1 rounded-full border border-bridge-stone/30 bg-bridge-parchment p-1 text-xs">
          <FilterChip selected={filter === 'all'} onClick={() => setFilter('all')}>
            All ({bridges.length})
          </FilterChip>
          <FilterChip
            selected={filter === 'restored'}
            onClick={() => setFilter('restored')}
          >
            Restored
          </FilterChip>
          <FilterChip
            selected={filter === 'photograph_only'}
            onClick={() => setFilter('photograph_only')}
          >
            Photo Only
          </FilterChip>
        </div>
      </div>

      {/* Loading state */}
      {loading && bridges === FALLBACK_BRIDGES && (
        <p className="text-sm text-bridge-stone">Loading the latest from the field…</p>
      )}

      {/* Content */}
      {view === 'list' ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleBridges.map((bridge, i) => (
            <li
              key={bridge.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <BridgeCard
                bridge={bridge}
                distanceMi={
                  userLocation ? haversineMiles(userLocation, bridge.location) : null
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-[70vh] min-h-[420px]">
          <BridgeMap bridges={visibleBridges} />
        </div>
      )}
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? 'rounded-full bg-bridge-navy px-3 py-1 font-sans font-semibold text-white'
          : 'rounded-full px-3 py-1 font-sans text-bridge-stone hover:text-bridge-ink'
      }
    >
      {children}
    </button>
  );
}
