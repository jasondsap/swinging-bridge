'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Loader2, Sparkles, Trash2 } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';

interface Itinerary {
  id: string;
  title: string;
  description?: string;
  narrative?: string;
  source: 'user' | 'ai' | 'curated';
  stops?: Array<{
    order: number;
    stopType: 'bridge' | 'place' | 'custom';
    bridge?: { name?: string; slug?: string } | string;
    place?: { name?: string; slug?: string } | string;
    customNote?: string;
    estimatedTime?: string;
  }>;
  createdAt: string;
}

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !params?.id) return;

    api<{ itinerary: Itinerary }>(`/api/itineraries/${params.id}`)
      .then((res) => setTrip(res.itinerary))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load trip'));
  }, [user, authLoading, params?.id]);

  async function handleDelete() {
    if (!params?.id) return;
    setDeleting(true);
    try {
      await api(`/api/itineraries/${params.id}`, { method: 'DELETE' });
      router.push('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  if (authLoading) return <div className="container-app py-10 text-bridge-stone">Loading…</div>;
  if (!user) {
    return (
      <div className="container-app py-10 text-center">
        <p className="text-bridge-stone">Sign in to view this trip.</p>
        <Link href="/login" className="mt-3 inline-block text-bridge-sky underline">
          Sign in
        </Link>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-app py-10 text-center">
        <p className="text-bridge-rust">{error}</p>
        <Link href="/trip" className="mt-3 inline-block text-bridge-sky underline">
          Back to trips
        </Link>
      </div>
    );
  }
  if (!trip) {
    return (
      <div className="container-app flex items-center gap-2 py-10 text-bridge-stone">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your trip…
      </div>
    );
  }

  const hasStops = Array.isArray(trip.stops) && trip.stops.length > 0;

  return (
    <div className="container-app py-6 pb-12">
      {/* Top nav */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/trip"
          className="inline-flex items-center gap-1 text-sm font-semibold text-bridge-stone hover:text-bridge-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All trips
        </Link>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-bridge-stone hover:text-bridge-rust"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      {/* Title block */}
      <div className="rounded-xl border border-bridge-stone/15 bg-white p-5 shadow-paper">
        <p className="label-meta flex items-center gap-1.5">
          {trip.source === 'ai' && <Sparkles className="h-3 w-3" />}
          {trip.source === 'ai' ? 'AI-planned trip' : 'Saved trip'}
          {' · '}
          {formatDate(trip.createdAt)}
        </p>
        <h1
          className="mt-1 font-display text-3xl font-bold leading-tight text-bridge-navy"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {trip.title}
        </h1>
        {trip.description && (
          <p className="mt-2 text-bridge-ink/85">{trip.description}</p>
        )}
      </div>

      {/* Structured stops, if any */}
      {hasStops && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-bridge-navy">Stops</h2>
          <ol className="mt-3 space-y-2">
            {trip.stops!.sort((a, b) => a.order - b.order).map((stop, i) => (
              <StopRow key={i} stop={stop} index={i + 1} />
            ))}
          </ol>
        </section>
      )}

      {/* Narrative (AI-generated trips) */}
      {trip.narrative && (
        <section className="mt-8 rounded-xl border border-bridge-stone/15 bg-white p-5 shadow-paper">
          <div className="prose-trip">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-5 font-display text-xl font-bold text-bridge-navy first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-1.5 mt-4 font-display text-lg font-semibold text-bridge-navy">
                    {children}
                  </h3>
                ),
                p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-bridge-navy">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 ml-1 list-disc space-y-1 pl-4 marker:text-bridge-sun">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 ml-1 list-decimal space-y-1 pl-4 marker:text-bridge-sun">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                a: ({ href, children }) => {
                  if (href?.startsWith('/')) {
                    return (
                      <Link href={href} className="text-bridge-sky underline-stroke">
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bridge-sky underline-stroke"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {trip.narrative}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bridge-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-bridge-stone/15 bg-white p-5 shadow-paper-hover"
          >
            <h2 className="font-display text-xl font-bold text-bridge-navy">Delete this trip?</h2>
            <p className="mt-2 text-sm text-bridge-ink/75">
              "{trip.title}" will be permanently removed. This can't be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-bridge-rust px-4 py-2.5 font-sans font-semibold text-white"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-full border-2 border-bridge-stone/30 px-4 py-2.5 font-sans font-semibold text-bridge-stone"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StopRow({ stop, index }: { stop: NonNullable<Itinerary['stops']>[number]; index: number }) {
  let label = stop.customNote || 'Stop';
  let href: string | null = null;

  if (stop.stopType === 'bridge' && typeof stop.bridge === 'object' && stop.bridge?.name) {
    label = stop.bridge.name;
    if (stop.bridge.slug) href = `/bridges/${stop.bridge.slug}`;
  } else if (stop.stopType === 'place' && typeof stop.place === 'object' && stop.place?.name) {
    label = stop.place.name;
    if (stop.place.slug) href = `/places/${stop.place.slug}`;
  }

  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-bridge-stone/15 bg-white p-3 shadow-paper">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bridge-navy text-xs font-bold text-white">
        {index}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-bridge-navy">{label}</p>
        {stop.estimatedTime && <p className="label-meta">{stop.estimatedTime}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : <li>{content}</li>;
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
