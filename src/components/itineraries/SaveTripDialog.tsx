'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface SaveTripDialogProps {
  open: boolean;
  onClose: () => void;
  /** The full markdown text that will be saved as the trip narrative */
  narrative: string;
  /** Optional first prompt from the conversation, used to suggest a title */
  suggestedTitle?: string;
}

/**
 * Modal dialog for saving an AI-generated trip plan.
 * Pre-fills a title suggestion based on the first line of the narrative.
 */
export function SaveTripDialog({
  open,
  onClose,
  narrative,
  suggestedTitle,
}: SaveTripDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Pre-fill title when opened
  useEffect(() => {
    if (!open) return;
    setTitle(suggestedTitle || deriveTitleFromNarrative(narrative));
    setError(null);
    setSavedId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, narrative, suggestedTitle]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Unauthenticated state — prompt to sign in
  if (!user) {
    return (
      <Backdrop onClose={onClose}>
        <h2 className="font-display text-xl font-bold text-bridge-navy">Sign in to save trips</h2>
        <p className="mt-2 text-sm text-bridge-ink/80">
          Save AI-planned trips to your profile so you can come back to them on the road.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/login?redirect=/chat');
            }}
            className="flex-1 rounded-full bg-bridge-navy px-4 py-2.5 font-sans font-semibold text-white"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-bridge-stone/30 px-4 py-2.5 font-sans font-semibold text-bridge-stone"
          >
            Cancel
          </button>
        </div>
      </Backdrop>
    );
  }

  // Saved confirmation state
  if (savedId) {
    return (
      <Backdrop onClose={onClose}>
        <h2 className="font-display text-xl font-bold text-bridge-navy">Trip saved</h2>
        <p className="mt-2 text-sm text-bridge-ink/80">
          You'll find it in <span className="font-semibold">Trips</span>.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(`/trip/${savedId}`);
            }}
            className="flex-1 rounded-full bg-bridge-navy px-4 py-2.5 font-sans font-semibold text-white"
          >
            View trip
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-bridge-stone/30 px-4 py-2.5 font-sans font-semibold text-bridge-stone"
          >
            Keep chatting
          </button>
        </div>
      </Backdrop>
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Give the trip a name.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ id: string }>('/api/itineraries/save-from-chat', {
        method: 'POST',
        body: { title: title.trim(), narrative },
      });
      setSavedId(res.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the trip.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-bridge-navy">Save this trip</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 rounded-full p-1 text-bridge-stone hover:bg-bridge-parchment"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 text-sm text-bridge-ink/70">
        We'll keep the full plan here, ready when you are.
      </p>

      <label className="mt-4 block">
        <span className="label-meta">Title</span>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="e.g., Half-day with the kids"
          className="mt-1 w-full rounded-lg border border-bridge-stone/30 bg-white px-3 py-2 font-sans text-bridge-ink focus:border-bridge-navy focus:outline-none"
        />
      </label>

      {error && (
        <p className="mt-2 text-sm text-bridge-rust">{error}</p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-full bg-bridge-navy px-4 py-2.5 font-sans font-semibold text-white transition-colors hover:bg-bridge-navy-deep',
            busy && 'opacity-60',
          )}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save trip
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-full border-2 border-bridge-stone/30 px-4 py-2.5 font-sans font-semibold text-bridge-stone"
        >
          Cancel
        </button>
      </div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-bridge-ink/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-fade-up rounded-2xl border border-bridge-stone/15 bg-white p-5 shadow-paper-hover"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Best-effort title from the first heading or sentence of the narrative.
 */
function deriveTitleFromNarrative(text: string): string {
  if (!text) return 'My Clay County Trip';
  // Look for the first markdown heading
  const headingMatch = text.match(/^#{1,3}\s+(.+)$/m);
  if (headingMatch) {
    return truncate(headingMatch[1].trim(), 80);
  }
  // Otherwise take the first sentence-ish chunk
  const firstLine = text.split('\n').map((l) => l.trim()).find(Boolean) || '';
  const stripped = firstLine.replace(/[*_`#>-]/g, '').trim();
  return truncate(stripped || 'My Clay County Trip', 80);
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}
