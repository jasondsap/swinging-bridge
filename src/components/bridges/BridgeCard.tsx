import Link from 'next/link';
import { MapPin } from 'lucide-react';

import type { FallbackBridge } from '@/data/bridges-fallback';
import { BridgeStatusBadge } from './BridgeStatusBadge';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { cn, formatDistance } from '@/lib/utils';

interface BridgeCardProps {
  bridge: FallbackBridge & { id?: string };
  /** Optional distance in miles from the user's location */
  distanceMi?: number | null;
  /** Show a more compact layout (used inside map popups) */
  compact?: boolean;
  /** Hide the favorite button (e.g. when the parent already shows one) */
  hideFavorite?: boolean;
  className?: string;
}

/**
 * Postcard-style card.
 *
 * The Link is one child and the FavoriteButton is a separate sibling
 * positioned absolutely — we can't nest <button> inside <a> and keep
 * valid HTML. The favorite button has its own click handler that
 * stops propagation.
 */
export function BridgeCard({ bridge, distanceMi, compact, hideFavorite, className }: BridgeCardProps) {
  // Use slug as fallback id when running off the hardcoded data set
  const targetId = bridge.id ?? bridge.slug;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-bridge-stone/20 bg-white shadow-paper transition-all duration-200 hover:-translate-y-0.5 hover:shadow-paper-hover',
        className,
      )}
    >
      <Link href={`/bridges/${bridge.slug}`} className="block">
        {/* Photo strip */}
        <div
          className={cn(
            'relative w-full overflow-hidden',
            compact ? 'h-28' : 'h-44',
            'bg-gradient-to-br from-bridge-navy via-bridge-sky to-bridge-mist',
          )}
        >
          <PhotoPlaceholder bridge={bridge} />
          <div className="absolute right-3 top-3">
            <BridgeStatusBadge status={bridge.status} size={compact ? 'sm' : 'md'} />
          </div>
        </div>

        {/* Body */}
        <div className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className={cn(
                'font-display font-semibold leading-tight text-bridge-navy',
                compact ? 'text-lg' : 'text-xl',
              )}
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {bridge.name}
            </h3>
            {distanceMi != null && (
              <span className="label-meta shrink-0">{formatDistance(distanceMi)}</span>
            )}
          </div>

          {bridge.alternateName && !compact && (
            <p className="mt-0.5 font-display text-sm italic text-bridge-stone">
              "{bridge.alternateName}"
            </p>
          )}

          <div className="mt-2 flex items-center gap-1.5 text-bridge-stone">
            <MapPin className="h-3 w-3" />
            <span className="label-meta">
              {bridge.location.nearestCommunity}
              {bridge.location.waterway && (
                <>
                  {' · '}
                  {waterwayLabel(bridge.location.waterway)}
                </>
              )}
            </span>
          </div>

          {!compact && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-bridge-ink/80">
              {bridge.shortDescription}
            </p>
          )}
        </div>
      </Link>

      {/* Favorite button — sibling of Link, not child, to keep HTML valid */}
      {!hideFavorite && (
        <div className="absolute left-3 top-3 z-10">
          <FavoriteButton
            targetType="bridge"
            targetId={targetId}
            returnTo={`/bridges/${bridge.slug}`}
            size={compact ? 'sm' : 'md'}
          />
        </div>
      )}
    </div>
  );
}

function waterwayLabel(w: string): string {
  return (
    {
      goose_creek: 'Goose Creek',
      red_bird: 'Red Bird River',
      south_fork: 'South Fork',
      other: '',
    }[w] || ''
  );
}

function PhotoPlaceholder({ bridge }: { bridge: FallbackBridge }) {
  const seed = bridge.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sway = (seed % 5) - 2;

  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${bridge.slug}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a4c4dd" />
          <stop offset="1" stopColor="#FAF6EE" />
        </linearGradient>
        <linearGradient id={`hill-${bridge.slug}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d5f3f" stopOpacity="0.85" />
          <stop offset="1" stopColor="#1e3a5f" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#sky-${bridge.slug})`} />
      <path d="M 0 130 Q 100 100 200 120 T 400 110 L 400 200 L 0 200 Z" fill="#2d5f3f" opacity="0.4" />
      <path
        d="M 0 160 Q 150 130 280 155 T 400 145 L 400 200 L 0 200 Z"
        fill={`url(#hill-${bridge.slug})`}
      />
      <line x1="60" y1="160" x2="60" y2="80" stroke="#8b6f47" strokeWidth="3" />
      <line x1="340" y1="155" x2="340" y2="80" stroke="#8b6f47" strokeWidth="3" />
      <path
        d={`M 60 85 Q 200 ${145 + sway} 340 85`}
        stroke="#1e3a5f"
        strokeWidth="2"
        fill="none"
        opacity="0.85"
      />
      <path
        d={`M 60 ${135 + sway} Q 200 ${165 + sway} 340 ${135 + sway}`}
        stroke="#8b6f47"
        strokeWidth="4"
        fill="none"
      />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
        const x = 60 + (340 - 60) * t;
        const cableY = 85 + (1 - 4 * (t - 0.5) * (t - 0.5)) * (60 + sway);
        const deckY = 135 + sway + Math.sin(t * Math.PI) * 30;
        return (
          <line
            key={t}
            x1={x}
            y1={cableY}
            x2={x}
            y2={deckY}
            stroke="#8b6f47"
            strokeWidth="1"
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}
