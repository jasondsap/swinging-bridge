import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

import type { FallbackPlace, PlaceType } from '@/data/places-fallback';
import { PlaceTypeBadge, PLACE_TYPE_CONFIG } from './PlaceTypeBadge';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { cn, formatDistance } from '@/lib/utils';

interface PlaceCardProps {
  place: FallbackPlace & { id?: string };
  distanceMi?: number | null;
  compact?: boolean;
  hideFavorite?: boolean;
  className?: string;
}

export function PlaceCard({ place, distanceMi, compact, hideFavorite, className }: PlaceCardProps) {
  const targetId = place.id ?? place.slug;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-bridge-stone/20 bg-white shadow-paper transition-all duration-200 hover:-translate-y-0.5 hover:shadow-paper-hover',
        className,
      )}
    >
      <Link href={`/places/${place.slug}`} className="block">
        <div
          className={cn(
            'relative w-full overflow-hidden',
            compact ? 'h-28' : 'h-40',
          )}
        >
          <PlacePhoto place={place} />
          <div className="absolute right-3 top-3">
            <PlaceTypeBadge type={place.placeType} size={compact ? 'sm' : 'md'} />
          </div>
          {place.featured && !compact && (
            <div className="absolute left-3 bottom-3">
              <span className="inline-flex items-center gap-1 rounded-sm border border-bridge-sun bg-bridge-sun/95 px-1.5 py-0.5 text-[0.6rem] font-sans font-bold uppercase tracking-small-caps text-bridge-navy">
                <Star className="h-3 w-3 fill-bridge-navy" />
                Featured
              </span>
            </div>
          )}
        </div>

        <div className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className={cn(
                'font-display font-semibold leading-tight text-bridge-navy',
                compact ? 'text-base' : 'text-lg',
              )}
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {place.name}
            </h3>
            {distanceMi != null && (
              <span className="label-meta shrink-0">{formatDistance(distanceMi)}</span>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-bridge-stone">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="label-meta truncate">
              {place.location.community}
              {place.priceRange && place.priceRange !== 'free' && (
                <>
                  {' · '}
                  {priceLabel(place.priceRange)}
                </>
              )}
              {place.priceRange === 'free' && <> · Free</>}
            </span>
          </div>

          {!compact && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bridge-ink/80">
              {place.shortDescription}
            </p>
          )}
        </div>
      </Link>

      {/* Favorite button — sibling of Link, not child, to keep HTML valid */}
      {!hideFavorite && (
        <div className="absolute left-3 top-3 z-10">
          <FavoriteButton
            targetType="place"
            targetId={targetId}
            returnTo={`/places/${place.slug}`}
            size={compact ? 'sm' : 'md'}
          />
        </div>
      )}
    </div>
  );
}

function priceLabel(range: string): string {
  return (
    {
      '1': '$',
      '2': '$$',
      '3': '$$$',
      '4': '$$$$',
    }[range] || ''
  );
}

/**
 * SVG photo placeholder per place type — different gradient + icon
 * silhouette for each, so the cards feel distinct without real photos.
 */
function PlacePhoto({ place }: { place: FallbackPlace }) {
  const cfg = TYPE_CONFIG_VISUAL[place.placeType] ?? TYPE_CONFIG_VISUAL.attraction;
  const Icon = PLACE_TYPE_CONFIG[place.placeType].icon;

  // Per-place subtle variation
  const seed = place.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const offset = (seed % 5) - 2;

  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-${place.slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cfg.from} />
          <stop offset="1" stopColor={cfg.to} />
        </linearGradient>
        <pattern
          id={`dot-${place.slug}`}
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)" />
        </pattern>
      </defs>
      <rect width="400" height="200" fill={`url(#grad-${place.slug})`} />
      <rect width="400" height="200" fill={`url(#dot-${place.slug})`} />
      <path
        d={`M 0 ${145 + offset} Q 100 ${130 + offset} 200 ${140 + offset} T 400 ${135 + offset} L 400 200 L 0 200 Z`}
        fill="rgba(255,255,255,0.12)"
      />
      <foreignObject x="280" y="40" width="100" height="100">
        <div
          // @ts-expect-error xmlns required for foreignObject
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <Icon className="h-20 w-20" />
        </div>
      </foreignObject>
    </svg>
  );
}

const TYPE_CONFIG_VISUAL: Record<PlaceType, { from: string; to: string }> = {
  restaurant: { from: '#a8472a', to: '#8b6f47' },
  hotel: { from: '#1e3a5f', to: '#4a90c2' },
  rental: { from: '#4a90c2', to: '#a4c4dd' },
  campground: { from: '#2d5f3f', to: '#7ea487' },
  outdoor: { from: '#2d5f3f', to: '#1e3a5f' },
  attraction: { from: '#d6a911', to: '#a8472a' },
  museum: { from: '#8b6f47', to: '#9a937f' },
  shopping: { from: '#9a937f', to: '#a4c4dd' },
  service: { from: '#9a937f', to: '#7ea487' },
};
