'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Heart, LogOut, Route, Sparkles, User } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { useFavorites } from '@/components/favorites/FavoritesProvider';
import { BridgeCard } from '@/components/bridges/BridgeCard';
import { api } from '@/lib/api-client';
import type { FallbackBridge } from '@/data/bridges-fallback';

interface ItinerarySummary {
  id: string;
  title: string;
  description?: string;
  source: 'user' | 'ai' | 'curated';
  stopCount: number;
  hasNarrative: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const { favorites } = useFavorites();
  const [trips, setTrips] = useState<ItinerarySummary[] | null>(null);

  useEffect(() => {
    if (!user) {
      setTrips(null);
      return;
    }
    api<{ itineraries: ItinerarySummary[] }>('/api/itineraries/me')
      .then((res) => setTrips(res.itineraries))
      .catch(() => setTrips([]));
  }, [user]);

  if (loading) {
    return <div className="container-app py-10 text-bridge-stone">Loading…</div>;
  }

  if (!user) {
    return <SignedOutState />;
  }

  const bridgeFavorites = favorites.filter((f) => f.targetType === 'bridge');
  const recentTrips = (trips ?? []).slice(0, 3);

  return (
    <div className="container-app py-6">
      {/* Profile header */}
      <section className="rounded-xl border border-bridge-stone/15 bg-white p-5 shadow-paper">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-bridge-sun bg-bridge-navy text-bridge-sun">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-meta">Signed in as</p>
            <h1
              className="mt-0.5 truncate font-display text-xl font-bold text-bridge-navy"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {user.name || user.email || 'Visitor'}
            </h1>
            {user.email && user.email !== user.name && (
              <p className="truncate text-sm text-bridge-stone">{user.email}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-bridge-stone/30 px-3 py-1.5 font-sans text-sm font-semibold text-bridge-stone hover:border-bridge-rust hover:text-bridge-rust"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </section>

      {/* Saved favorites */}
      <section className="mt-8">
        <SectionHeader
          icon={<Heart className="h-4 w-4" />}
          title="Saved bridges"
          count={bridgeFavorites.length}
          allHref="#favorites"
        />
        {bridgeFavorites.length === 0 ? (
          <EmptyHint>
            Tap the heart on any bridge card to save it here for later.
          </EmptyHint>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bridgeFavorites.map((fav) => {
              const bridge = fav.bridge as FallbackBridge & { id?: string } | null;
              if (!bridge) return null;
              return (
                <li key={fav.id}>
                  <BridgeCard bridge={bridge} compact />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Saved trips */}
      <section className="mt-8">
        <SectionHeader
          icon={<Route className="h-4 w-4" />}
          title="Saved trips"
          count={trips?.length ?? 0}
          allHref="/trip"
        />
        {trips === null ? (
          <p className="mt-3 text-sm text-bridge-stone">Loading your trips…</p>
        ) : trips.length === 0 ? (
          <EmptyHint>
            Plan a trip with the{' '}
            <Link href="/chat" className="font-semibold text-bridge-sky underline-stroke">
              AI Trip Guide
            </Link>{' '}
            and save it here.
          </EmptyHint>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentTrips.map((trip) => (
              <li key={trip.id}>
                <TripRow trip={trip} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  allHref,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  allHref?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-bridge-navy">
        <span className="text-bridge-stone">{icon}</span>
        {title}
        <span className="label-meta ml-1">{count}</span>
      </h2>
      {allHref && count > 0 && (
        <Link href={allHref} className="text-xs font-semibold text-bridge-sky">
          View all →
        </Link>
      )}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-bridge-stone/30 bg-white/50 p-4 text-sm text-bridge-stone">
      {children}
    </div>
  );
}

function TripRow({ trip }: { trip: ItinerarySummary }) {
  return (
    <Link
      href={`/trip/${trip.id}`}
      className="flex items-center gap-3 rounded-xl border border-bridge-stone/15 bg-white p-3 shadow-paper transition-shadow hover:shadow-paper-hover"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bridge-parchment text-bridge-navy">
        {trip.source === 'ai' ? <Sparkles className="h-4 w-4" /> : <Route className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold text-bridge-navy">{trip.title}</p>
        <p className="label-meta">
          {trip.source === 'ai' ? 'AI-planned' : 'Saved trip'}
          {trip.stopCount > 0 && ` · ${trip.stopCount} stops`}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-bridge-stone" />
    </Link>
  );
}

function SignedOutState() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-bridge-sun bg-bridge-navy text-bridge-sun">
        <User className="h-6 w-6" />
      </div>
      <h1
        className="mt-4 font-display text-2xl font-bold text-bridge-navy"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        Sign in to save your trip
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-bridge-ink/75">
        Save favorite bridges, build itineraries, and pick up planning where you left off.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-bridge-navy px-5 py-2.5 font-sans font-semibold text-white shadow-paper hover:bg-bridge-navy-deep"
      >
        Sign in
      </Link>
    </div>
  );
}
