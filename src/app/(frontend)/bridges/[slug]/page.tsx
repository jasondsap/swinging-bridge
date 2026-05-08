'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, MapPin, Ruler, Users, Weight } from 'lucide-react';

import { BridgeStatusBadge } from '@/components/bridges/BridgeStatusBadge';
import { DirectionsButton } from '@/components/bridges/DirectionsButton';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import {
  FALLBACK_BRIDGES,
  type FallbackBridge,
} from '@/data/bridges-fallback';
import { haversineMiles, formatDistance } from '@/lib/utils';

const BridgeMap = dynamic(() => import('@/components/bridges/BridgeMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-bridge-parchment" />,
});

export default function BridgeDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [bridges, setBridges] = useState<FallbackBridge[]>(FALLBACK_BRIDGES);
  const [showFullDirections, setShowFullDirections] = useState(false);

  useEffect(() => {
    fetch('/api/bridges')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.bridges)) setBridges(data.bridges);
      })
      .catch(() => {});
  }, []);

  const bridge = useMemo(() => bridges.find((b) => b.slug === slug), [bridges, slug]);

  const nearbyBridges = useMemo(() => {
    if (!bridge) return [];
    return bridges
      .filter((b) => b.slug !== bridge.slug)
      .map((b) => ({
        bridge: b,
        miles: haversineMiles(bridge.location, b.location),
      }))
      .sort((a, b) => a.miles - b.miles)
      .slice(0, 3);
  }, [bridge, bridges]);

  if (!bridge) {
    return (
      <div className="container-app py-12 text-center">
        <p className="text-bridge-stone">That bridge isn't in our records.</p>
        <Link href="/bridges" className="mt-4 inline-block text-bridge-sky underline">
          Back to all bridges
        </Link>
      </div>
    );
  }

  const isRestored = bridge.status === 'restored';

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="relative h-72 overflow-hidden bg-gradient-to-br from-bridge-navy via-bridge-sky to-bridge-mist">
        <BridgeIllustration bridge={bridge} />
        <Link
          href="/bridges"
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-bridge-navy shadow-paper"
          aria-label="Back to all bridges"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="absolute right-4 top-4 z-10 animate-stamp">
          <BridgeStatusBadge status={bridge.status} size="lg" />
        </div>
      </section>

      {/* Editorial title block */}
      <div className="container-app -mt-8 relative z-10">
        <div className="rounded-xl border border-bridge-stone/15 bg-white p-5 shadow-paper">
          <p className="label-meta">
            {bridge.location.nearestCommunity}
            {bridge.location.waterway && (
              <>
                {' · '}
                {waterwayLabel(bridge.location.waterway)}
              </>
            )}
          </p>
          <h1
            className="mt-1 font-display text-3xl font-bold leading-tight text-bridge-navy"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            {bridge.name}
          </h1>
          {bridge.alternateName && (
            <p className="mt-1 font-display text-base italic text-bridge-stone">
              "{bridge.alternateName}"
            </p>
          )}
          <p className="mt-3 text-bridge-ink/85">{bridge.shortDescription}</p>

          {/* Primary actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <DirectionsButton
              latitude={bridge.location.latitude}
              longitude={bridge.location.longitude}
              label={bridge.name}
            />
            <FavoriteButton
              targetType="bridge"
              targetId={(bridge as { id?: string }).id ?? bridge.slug}
              returnTo={`/bridges/${bridge.slug}`}
              variant="pill"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Specs strip — visible only if any spec is present */}
      {bridge.specs && Object.values(bridge.specs).some(Boolean) && (
        <div className="container-app mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {bridge.specs.lengthFeet && (
              <SpecTile icon={<Ruler className="h-4 w-4" />} label="Length">
                {bridge.specs.lengthFeet} ft
              </SpecTile>
            )}
            {bridge.specs.yearBuilt && (
              <SpecTile label="Built">{bridge.specs.yearBuilt}</SpecTile>
            )}
            <SpecTile icon={<Users className="h-4 w-4" />} label="Max">
              {bridge.specs.maxOccupants ?? 4} people
            </SpecTile>
            <SpecTile icon={<Weight className="h-4 w-4" />} label="Limit">
              {bridge.specs.maxWeightPounds ?? 800} lbs
            </SpecTile>
          </div>
        </div>
      )}

      {/* Description */}
      <section className="container-app mt-8">
        <h2 className="font-display text-xl font-bold text-bridge-navy">About this bridge</h2>
        <p className="mt-3 leading-relaxed text-bridge-ink/85">{bridge.description}</p>
      </section>

      {/* Map */}
      <section className="container-app mt-8">
        <h2 className="font-display text-xl font-bold text-bridge-navy">Location</h2>
        <p className="mt-1 text-sm text-bridge-stone">
          {bridge.location.latitude.toFixed(4)}°N, {Math.abs(bridge.location.longitude).toFixed(4)}°W
          {!bridge.coordinatesVerified && (
            <span className="ml-2 text-bridge-rust">(approximate)</span>
          )}
        </p>
        <div className="mt-3 h-64">
          <BridgeMap bridges={[bridge]} focusSlug={bridge.slug} variant="detail" />
        </div>
      </section>

      {/* Driving directions — collapsible */}
      {bridge.location.directions && (
        <section className="container-app mt-8">
          <button
            type="button"
            onClick={() => setShowFullDirections((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-bridge-stone/20 bg-white px-4 py-3 text-left shadow-paper"
          >
            <span className="flex items-center gap-2 font-display font-semibold text-bridge-navy">
              <MapPin className="h-4 w-4" /> Driving directions
            </span>
            <ChevronDown
              className={`h-4 w-4 text-bridge-stone transition-transform ${
                showFullDirections ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showFullDirections && (
            <div className="mt-3 rounded-xl border border-bridge-stone/15 bg-bridge-parchment p-4">
              <p className="label-meta">From the Square in downtown Manchester</p>
              <p className="mt-2 leading-relaxed text-bridge-ink/85">
                {bridge.location.directions}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Safety notes — only for crossable bridges */}
      {isRestored && (
        <section className="container-app mt-8">
          <div className="rounded-xl border-l-4 border-bridge-sun bg-bridge-sun/10 p-4">
            <p className="label-meta text-bridge-navy">Before you cross</p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-bridge-ink/85">
              <li>• Cross at your own risk — the non-profit and county aren't liable for accidents.</li>
              <li>• No more than 4 people or 800 pounds total on the bridge at once.</li>
              <li>• Don't bounce or jump on the deck.</li>
              <li>• Each end may sit on private property — respect landowners and pack out trash.</li>
            </ul>
          </div>
        </section>
      )}
      {!isRestored && (
        <section className="container-app mt-8">
          <div className="rounded-xl border-l-4 border-bridge-rust bg-bridge-rust/10 p-4">
            <p className="label-meta text-bridge-rust">Photograph only</p>
            <p className="mt-2 text-sm leading-relaxed text-bridge-ink/85">
              This bridge has not been restored and is not safe to cross. Please admire it from a distance — view from the road or nearby parking only.
            </p>
          </div>
        </section>
      )}

      {/* Nearby bridges */}
      {nearbyBridges.length > 0 && (
        <section className="container-app mt-10">
          <h2 className="font-display text-xl font-bold text-bridge-navy">Bridges nearby</h2>
          <ul className="mt-3 space-y-2">
            {nearbyBridges.map(({ bridge: nearby, miles }) => (
              <li key={nearby.slug}>
                <Link
                  href={`/bridges/${nearby.slug}`}
                  className="flex items-center justify-between rounded-xl border border-bridge-stone/15 bg-white px-4 py-3 shadow-paper transition-shadow hover:shadow-paper-hover"
                >
                  <div>
                    <p className="font-display font-semibold text-bridge-navy">{nearby.name}</p>
                    <p className="label-meta mt-0.5">{nearby.location.nearestCommunity}</p>
                  </div>
                  <span className="label-meta">{formatDistance(miles)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SpecTile({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-bridge-stone/15 bg-white p-3 text-center shadow-paper">
      <div className="flex items-center justify-center gap-1 text-bridge-stone">
        {icon}
        <span className="label-meta">{label}</span>
      </div>
      <p className="mt-1 font-display text-base font-semibold text-bridge-navy">{children}</p>
    </div>
  );
}

function waterwayLabel(w: string): string {
  return (
    {
      goose_creek: 'Goose Creek',
      red_bird: 'Red Bird River',
      south_fork: 'South Fork of the Kentucky',
      other: '',
    }[w] || ''
  );
}

/**
 * Larger detail-page hero illustration — stylized swinging bridge silhouette.
 */
function BridgeIllustration({ bridge }: { bridge: FallbackBridge }) {
  const seed = bridge.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sway = (seed % 5) - 2;
  return (
    <svg
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a4c4dd" />
          <stop offset="1" stopColor="#FAF6EE" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill="url(#hero-sky)" />
      {/* far ridges */}
      <path d="M 0 200 Q 200 160 400 180 T 800 170 L 800 320 L 0 320 Z" fill="#2d5f3f" opacity="0.35" />
      <path d="M 0 240 Q 250 200 500 230 T 800 220 L 800 320 L 0 320 Z" fill="#2d5f3f" opacity="0.55" />
      {/* near hill */}
      <path d="M 0 270 Q 300 230 550 260 T 800 245 L 800 320 L 0 320 Z" fill="#1e3a5f" opacity="0.85" />
      {/* towers */}
      <line x1="120" y1="270" x2="120" y2="120" stroke="#8b6f47" strokeWidth="5" />
      <line x1="680" y1="265" x2="680" y2="120" stroke="#8b6f47" strokeWidth="5" />
      <line x1="115" y1="125" x2="125" y2="125" stroke="#8b6f47" strokeWidth="3" />
      <line x1="675" y1="125" x2="685" y2="125" stroke="#8b6f47" strokeWidth="3" />
      {/* main cables */}
      <path
        d={`M 120 130 Q 400 ${230 + sway * 2} 680 130`}
        stroke="#1e3a5f"
        strokeWidth="3"
        fill="none"
      />
      {/* deck */}
      <path
        d={`M 120 ${220 + sway} Q 400 ${265 + sway} 680 ${220 + sway}`}
        stroke="#8b6f47"
        strokeWidth="6"
        fill="none"
      />
      {/* hangers */}
      {Array.from({ length: 16 }).map((_, i) => {
        const t = i / 15;
        const x = 120 + (680 - 120) * t;
        const dropFactor = 1 - 4 * (t - 0.5) * (t - 0.5);
        const cableY = 130 + dropFactor * (100 + sway * 2);
        const deckY = 220 + sway + dropFactor * 45;
        return (
          <line key={i} x1={x} y1={cableY} x2={x} y2={deckY} stroke="#8b6f47" strokeWidth="1.2" opacity="0.65" />
        );
      })}
    </svg>
  );
}
