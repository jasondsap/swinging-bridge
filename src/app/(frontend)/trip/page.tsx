'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Route, Sparkles } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';

interface ItinerarySummary {
  id: string;
  title: string;
  description?: string;
  source: 'user' | 'ai' | 'curated';
  stopCount: number;
  hasNarrative: boolean;
  createdAt: string;
}

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<ItinerarySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTrips(null);
      return;
    }
    api<{ itineraries: ItinerarySummary[] }>('/api/itineraries/me')
      .then((res) => setTrips(res.itineraries))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load trips'));
  }, [user]);

  if (authLoading) return <div className="container-app py-10 text-bridge-stone">Loading…</div>;
  if (!user) return <SignedOutPrompt />;

  return (
    <div className="container-app py-6">
      <div className="mb-6">
        <p className="label-meta">Your trips</p>
        <h1
          className="mt-1 font-display text-3xl font-bold leading-tight text-bridge-navy"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Saved <span className="underline-stroke">itineraries</span>
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-bridge-rust/30 bg-bridge-rust/5 px-4 py-3 text-sm text-bridge-rust">
          {error}
        </div>
      )}

      {trips === null ? (
        <p className="text-sm text-bridge-stone">Loading your trips…</p>
      ) : trips.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {trips.map((trip, i) => (
            <li
              key={trip.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TripCard({ trip }: { trip: ItinerarySummary }) {
  return (
    <Link
      href={`/trip/${trip.id}`}
      className="block rounded-xl border border-bridge-stone/15 bg-white p-4 shadow-paper transition-all hover:-translate-y-0.5 hover:shadow-paper-hover"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bridge-parchment text-bridge-navy">
          {trip.source === 'ai' ? <Sparkles className="h-4 w-4" /> : <Route className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold leading-tight text-bridge-navy">
            {trip.title}
          </h2>
          <p className="label-meta mt-0.5">
            {trip.source === 'ai' ? 'AI-planned' : 'Saved trip'}
            {trip.stopCount > 0 && ` · ${trip.stopCount} stops`}
            {' · '}
            {formatDate(trip.createdAt)}
          </p>
          {trip.description && (
            <p className="mt-2 line-clamp-2 text-sm text-bridge-ink/75">{trip.description}</p>
          )}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-bridge-stone" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-bridge-stone/30 bg-white/50 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bridge-parchment text-bridge-navy">
        <Route className="h-5 w-5" />
      </div>
      <h2 className="mt-3 font-display text-lg font-bold text-bridge-navy">
        No saved trips yet
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-bridge-ink/70">
        Plan a day with the AI Trip Guide and tap "Save this trip" to keep it for the road.
      </p>
      <Link
        href="/chat"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-bridge-navy px-5 py-2.5 font-sans font-semibold text-white shadow-paper hover:bg-bridge-navy-deep"
      >
        Plan a trip
      </Link>
    </div>
  );
}

function SignedOutPrompt() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-bridge-sun bg-bridge-navy text-bridge-sun">
        <Route className="h-6 w-6" />
      </div>
      <h1
        className="mt-4 font-display text-2xl font-bold text-bridge-navy"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        Sign in to see your trips
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-bridge-ink/75">
        Sign in to save AI-planned itineraries and pull them up later on the road.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-bridge-navy px-5 py-2.5 font-sans font-semibold text-white shadow-paper"
      >
        Sign in
      </Link>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
