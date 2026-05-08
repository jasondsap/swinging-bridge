'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
} from 'lucide-react';

import {
  FALLBACK_PLACES,
  type FallbackPlace,
} from '@/data/places-fallback';
import { FALLBACK_BRIDGES } from '@/data/bridges-fallback';
import { PlaceTypeBadge } from '@/components/places/PlaceTypeBadge';
import { DirectionsButton } from '@/components/bridges/DirectionsButton';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { BridgeStatusBadge } from '@/components/bridges/BridgeStatusBadge';
import { formatPhone, haversineMiles } from '@/lib/utils';

// Leaflet has to live behind a dynamic import — it touches window on load.
const PlaceMap = dynamic(() => import('@/components/places/PlaceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full animate-pulse rounded-xl bg-bridge-parchment" />
  ),
});

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export default function PlaceDetailPage() {
  const params = useParams<{ slug: string }>();
  const [place, setPlace] = useState<FallbackPlace | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;

    // Try the API first; fall back to the bundled data so the page works
    // even when the dev server can't reach Postgres.
    let cancelled = false;

    fetch('/api/places')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = (Array.isArray(data.places) ? data.places : FALLBACK_PLACES) as FallbackPlace[];
        const found = list.find((p) => p.slug === params.slug);
        if (found) {
          setPlace(found);
        } else {
          // Final fallback: bundled data
          const bundled = FALLBACK_PLACES.find((p) => p.slug === params.slug);
          if (bundled) setPlace(bundled);
        }
      })
      .catch(() => {
        const bundled = FALLBACK_PLACES.find((p) => p.slug === params.slug);
        if (bundled && !cancelled) setPlace(bundled);
      })
      .finally(() => !cancelled && setLoaded(true));

    return () => {
      cancelled = true;
    };
  }, [params?.slug]);

  // Compute nearby bridges off the resolved place
  const nearbyBridges = useMemo(() => {
    if (!place) return [];
    return resolveNearbyBridges(place);
  }, [place]);

  if (!loaded) {
    return (
      <div className="container-app py-10 text-bridge-stone">Loading…</div>
    );
  }

  if (!place) {
    notFound();
  }

  const targetId = (place as FallbackPlace & { id?: string }).id ?? place.slug;

  return (
    <article>
      {/* Top nav */}
      <div className="container-app pt-4">
        <Link
          href="/places"
          className="inline-flex items-center gap-1 text-sm font-semibold text-bridge-stone hover:text-bridge-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All places
        </Link>
      </div>

      {/* Hero block */}
      <header className="container-app pt-3">
        <div className="flex items-center gap-2">
          <PlaceTypeBadge type={place.placeType} />
          {place.featured && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-bridge-sun bg-bridge-sun/95 px-1.5 py-0.5 text-[0.6rem] font-sans font-bold uppercase tracking-small-caps text-bridge-navy">
              <Star className="h-3 w-3 fill-bridge-navy" />
              Featured
            </span>
          )}
        </div>

        <h1
          className="mt-3 font-display text-3xl font-bold leading-tight text-bridge-navy sm:text-4xl"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {place.name}
        </h1>

        {place.location.community && (
          <p className="mt-1 flex items-center gap-1.5 text-bridge-stone">
            <MapPin className="h-4 w-4" />
            <span>{place.location.community}</span>
          </p>
        )}

        {/* Primary actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <DirectionsButton
            latitude={place.location.latitude}
            longitude={place.location.longitude}
            label={place.name}
          />
          <FavoriteButton
            targetType="place"
            targetId={targetId}
            returnTo={`/places/${place.slug}`}
            variant="pill"
            size="md"
          />
        </div>
      </header>

      {/* Description */}
      {place.description && (
        <section className="container-app mt-6">
          <p className="whitespace-pre-line leading-relaxed text-bridge-ink/85">
            {place.description}
          </p>
        </section>
      )}

      {/* Contact + Hours grid */}
      <section className="container-app mt-6 grid gap-4 sm:grid-cols-2">
        {(place.contact || place.location.address) && (
          <div className="rounded-xl border border-bridge-stone/15 bg-white p-4 shadow-paper">
            <p className="label-meta mb-3">Contact</p>
            <ul className="space-y-2.5 text-sm">
              {place.location.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bridge-stone" />
                  <span className="text-bridge-ink">{place.location.address}</span>
                </li>
              )}
              {place.contact?.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-bridge-stone" />
                  <a
                    href={`tel:${place.contact.phone.replace(/\D/g, '')}`}
                    className="text-bridge-sky hover:underline"
                  >
                    {formatPhone(place.contact.phone) || place.contact.phone}
                  </a>
                </li>
              )}
              {place.contact?.email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-bridge-stone" />
                  <a
                    href={`mailto:${place.contact.email}`}
                    className="text-bridge-sky hover:underline"
                  >
                    {place.contact.email}
                  </a>
                </li>
              )}
              {place.contact?.website && (
                <li className="flex items-start gap-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-bridge-stone" />
                  <a
                    href={place.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-bridge-sky hover:underline"
                  >
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              )}
              {place.contact?.bookingUrl && place.contact.bookingUrl !== place.contact.website && (
                <li className="flex items-start gap-2">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-bridge-stone" />
                  <a
                    href={place.contact.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bridge-sky hover:underline"
                  >
                    Book or reserve
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {place.hours && place.hours.length > 0 && (
          <div className="rounded-xl border border-bridge-stone/15 bg-white p-4 shadow-paper">
            <p className="label-meta mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Hours
            </p>
            <ul className="space-y-1.5 text-sm">
              {place.hours.map((h) => (
                <li
                  key={h.day}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="font-semibold text-bridge-navy">
                    {DAY_LABELS[h.day] || h.day}
                  </span>
                  <span className="text-bridge-ink/80">
                    {h.closed ? (
                      <span className="text-bridge-stone">Closed</span>
                    ) : h.open && h.close ? (
                      `${h.open} – ${h.close}`
                    ) : (
                      '—'
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Map */}
      <section className="container-app mt-6">
        <p className="label-meta mb-2">Location</p>
        <div className="overflow-hidden rounded-xl border border-bridge-stone/20 shadow-paper">
          <PlaceMap place={place} />
        </div>
        {!place.coordinatesVerified && (
          <p className="mt-2 text-xs text-bridge-stone">
            Map location is approximate — coordinates haven't been ground-truthed yet.
          </p>
        )}
      </section>

      {/* Nearby bridges */}
      {nearbyBridges.length > 0 && (
        <section className="container-app mt-8">
          <h2 className="font-display text-xl font-bold text-bridge-navy">
            Nearby swinging bridges
          </h2>
          <p className="mt-1 text-sm text-bridge-ink/75">
            Pair your visit with one of these stops.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {nearbyBridges.map(({ bridge, distance }) => (
              <li key={bridge.slug}>
                <Link
                  href={`/bridges/${bridge.slug}`}
                  className="flex items-start gap-3 rounded-xl border border-bridge-stone/15 bg-white p-3 shadow-paper transition-shadow hover:shadow-paper-hover"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display font-semibold text-bridge-navy">
                        {bridge.name}
                      </h3>
                      <BridgeStatusBadge status={bridge.status} size="sm" />
                    </div>
                    <p className="label-meta mt-0.5">
                      {bridge.location.nearestCommunity} · {distance.toFixed(1)} mi
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="h-12" />
    </article>
  );
}

/**
 * Resolve nearby bridges. Prefers the explicit list on the place if present;
 * otherwise computes by haversine and returns the three closest within ~15 miles.
 */
function resolveNearbyBridges(place: FallbackPlace) {
  const explicit = (place.nearbyBridges ?? [])
    .map((slug) => FALLBACK_BRIDGES.find((b) => b.slug === slug))
    .filter((b): b is (typeof FALLBACK_BRIDGES)[number] => Boolean(b))
    .map((bridge) => ({
      bridge,
      distance: haversineMiles(place.location, bridge.location),
    }));

  if (explicit.length > 0) return explicit;

  return FALLBACK_BRIDGES.map((bridge) => ({
    bridge,
    distance: haversineMiles(place.location, bridge.location),
  }))
    .sort((a, b) => a.distance - b.distance)
    .filter((entry) => entry.distance <= 15)
    .slice(0, 3);
}
