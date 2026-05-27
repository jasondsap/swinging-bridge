'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';

import { signInWithEmail } from '@/lib/auth/cognito';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Next.js 15 requires useSearchParams() in client components to be inside a
 * Suspense boundary, otherwise static prerendering fails at build time.
 * The outer component just renders the boundary; the inner does the actual work.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginShell() {
  return (
    <div className="container-app py-10">
      <h1
        className="font-display text-2xl font-bold text-bridge-navy"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        Sign in
      </h1>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'choose' | 'email'>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
      await refresh();
      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      if (/UserNotConfirmedException/i.test(message)) {
        setError(
          "Your email isn't verified yet. Check your inbox for a code, or sign up again to get a new one.",
        );
      } else if (/NotAuthorizedException|incorrect username/i.test(message)) {
        setError("Email or password doesn't match our records.");
      } else if (/UserNotFoundException/i.test(message)) {
        setError("We don't have an account for that email. Want to create one?");
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  const signupHref = `/signup${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;

  return (
    <div className="container-app py-10">
      <h1
        className="font-display text-2xl font-bold text-bridge-navy"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        Sign in
      </h1>
      <p className="mt-1 text-sm text-bridge-ink/75">
        Save your favorite bridges, build itineraries, and pick up where you left off.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-bridge-rust/30 bg-bridge-rust/5 px-3 py-2 text-sm text-bridge-rust">
          {error}
        </div>
      )}

      {mode === 'choose' && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setMode('email')}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-bridge-stone/30 bg-white px-4 py-3 font-sans font-semibold text-bridge-ink shadow-paper disabled:opacity-50"
          >
            <Mail className="h-5 w-5" />
            <span>Continue with Email</span>
          </button>
        </div>
      )}

      {mode === 'email' && (
        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="label-meta">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-bridge-stone/40 bg-white px-3 py-2 text-bridge-ink focus:border-bridge-navy focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="label-meta">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-bridge-stone/40 bg-white px-3 py-2 text-bridge-ink focus:border-bridge-navy focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bridge-navy px-4 py-3 font-sans font-semibold text-white shadow-paper hover:bg-bridge-navy-deep disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('choose');
              setError(null);
            }}
            className="block w-full text-center text-sm text-bridge-stone hover:text-bridge-ink"
          >
            Back to all sign-in options
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-bridge-stone">
        New here?{' '}
        <Link href={signupHref} className="font-semibold text-bridge-sky">
          Create an account
        </Link>
      </p>
    </div>
  );
}
