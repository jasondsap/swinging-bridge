'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

import type { FallbackBridge } from '@/data/bridges-fallback';
import { getBridgesBoundingBox } from '@/data/bridges-fallback';
import { BridgeCard } from './BridgeCard';

interface BridgeMapProps {
  bridges: FallbackBridge[];
  /** Optional pre-selected bridge slug to focus on */
  focusSlug?: string | null;
  /** Render small (single-bridge detail page) or full (directory) */
  variant?: 'detail' | 'directory';
}

/**
 * Custom SVG pin generator.
 *
 * Restored bridges → navy + sun-yellow ring (welcoming)
 * Photograph-only → rust + cream ring (caution)
 *
 * The pin shape suggests a small bridge silhouette in a circular frame.
 */
function pinIcon(status: FallbackBridge['status']): L.DivIcon {
  const ringColor = status === 'restored' ? '#f4c430' : '#a8472a';
  const fillColor = status === 'restored' ? '#1e3a5f' : '#8b6f47';

  const svg = `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <!-- pin shadow -->
      <ellipse cx="18" cy="42" rx="6" ry="1.5" fill="rgba(0,0,0,0.25)"/>
      <!-- pin body -->
      <path d="M 18 0 C 8 0 0 8 0 18 C 0 30 18 42 18 42 C 18 42 36 30 36 18 C 36 8 28 0 18 0 Z"
            fill="${fillColor}" stroke="${ringColor}" stroke-width="2.5"/>
      <!-- bridge silhouette inside -->
      <g transform="translate(6, 7)">
        <line x1="2" y1="14" x2="2" y2="3" stroke="${ringColor}" stroke-width="1.2"/>
        <line x1="22" y1="14" x2="22" y2="3" stroke="${ringColor}" stroke-width="1.2"/>
        <path d="M 2 4 Q 12 13 22 4" stroke="${ringColor}" stroke-width="1.2" fill="none"/>
        <path d="M 2 11 Q 12 16 22 11" stroke="${ringColor}" stroke-width="1.5" fill="none"/>
      </g>
    </svg>
  `.trim();

  return L.divIcon({
    className: 'bridge-pin',
    html: svg,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38],
  });
}

/**
 * Helper component that fits the map to the bounding box of all bridges
 * on first load, or zooms to a specific bridge if `focusSlug` is set.
 */
function MapBounds({ bridges, focusSlug }: { bridges: FallbackBridge[]; focusSlug?: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (!bridges.length) return;

    if (focusSlug) {
      const target = bridges.find((b) => b.slug === focusSlug);
      if (target) {
        map.setView([target.location.latitude, target.location.longitude], 13);
        return;
      }
    }

    const bbox = getBridgesBoundingBox(bridges);
    map.fitBounds(
      [
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ],
      { padding: [40, 40] },
    );
  }, [bridges, focusSlug, map]);

  return null;
}

export default function BridgeMap({ bridges, focusSlug, variant = 'directory' }: BridgeMapProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(focusSlug ?? null);

  const selectedBridge = useMemo(
    () => bridges.find((b) => b.slug === selectedSlug) ?? null,
    [bridges, selectedSlug],
  );

  // Fix Leaflet's default icon issue with bundlers
  useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-bridge-stone/20 shadow-paper">
      <MapContainer
        center={[37.22, -83.65]}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds bridges={bridges} focusSlug={focusSlug} />

        {bridges.map((bridge) => (
          <Marker
            key={bridge.slug}
            position={[bridge.location.latitude, bridge.location.longitude]}
            icon={pinIcon(bridge.status)}
            eventHandlers={{
              click: () => setSelectedSlug(bridge.slug),
            }}
          />
        ))}
      </MapContainer>

      {/* Bottom-sheet card for the selected bridge (directory mode only) */}
      {variant === 'directory' && selectedBridge && (
        <div
          key={selectedBridge.slug}
          className="absolute inset-x-3 bottom-3 z-[1000] animate-fade-up"
        >
          <BridgeCard bridge={selectedBridge} compact />
          <button
            type="button"
            onClick={() => setSelectedSlug(null)}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-bridge-stone shadow-paper hover:text-bridge-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
