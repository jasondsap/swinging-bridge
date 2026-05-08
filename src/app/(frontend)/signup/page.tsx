'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Apple, Loader2, Mail, MailCheck } from 'lucide-react';

import {
  confirmSignUpCode,
  resendCode,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/auth/cognito';
import { useAuth } from '@/components/auth/AuthProvider';

type Stage = 'choose' | 'form' | 'confirm';

// Suspense wrapper required because useSearchParams() in client components
// can't be statically prerendered. See Next.js 15 docs.
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';
  const { refresh } = useAuth();

  const [stage, setStage] = useState<Stage>('choose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // ─── Social ────────────────────────────────────────────
  async function handleApple() {
    setBusy(true);
    setError(null);
    try {
      await signInWithApple();
      await refresh();
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      await refresh();
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setBusy(false);
    }
  }

  // ─── Email + password create ─────────────────────────────
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setBusy(false);
      return;
    }

    try {
      await signUpWithEmail({ email: email.trim(), password, name: name.trim() });
      setStage('confirm');
      setInfo(`We sent a verification code to ${email}. Check your inbox.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-up failed';
      // Friendlier copy for common cases
      if (/UsernameExistsException|already exists/i.test(message)) {
        setError("There's already an account with that email. Try signing in instead.");
      } else if (/InvalidPasswordException/i.test(message)) {
        setError(
          'That password is too weak. Use at least 8 characters with a mix of upper, lower, number, and symbol.',
        );
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  // ─── Confirm verification code ──────────────────────────
  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await confirmSignUpCode(email.trim(), code.trim());
      // Auto-sign-in with the credentials they just registered
      await signInWithEmail(email.trim(), password);
      await refresh();
      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not confirm code';
      if (/CodeMismatchException/i.test(message)) {
        setError("That code doesn't match. Double-check the email.");
      } else if (/ExpiredCodeException/i.test(message)) {
        setError('That code expired. Tap "Send another code" below.');
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await resendCode(email.trim());
      setInfo(`A new code is on its way to ${email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setBusy(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="container-app py-10">
      {stage !== 'confirm' ? (
        <>
          <p className="label-meta">Welcome, traveler</p>
          <h1
            className="mt-1 font-display text-2xl font-bold text-bridge-navy"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Create your <span className="underline-stroke">account</span>
          </h1>
          <p className="mt-2 text-sm text-bridge-ink/75">
            So you can save bridges, build itineraries, and pick up planning where you left off.
          </p>
        </>
      ) : (
        <>
          <p className="label-meta">One more step</p>
          <h1
            className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-bridge-navy"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            <MailCheck className="h-6 w-6 text-bridge-sun" />
            Check your email
          </h1>
        </>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-bridge-rust/30 bg-bridge-rust/5 px-3 py-2 text-sm text-bridge-rust">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="mt-4 rounded-lg border border-bridge-forest/30 bg-bridge-forest/5 px-3 py-2 text-sm text-bridge-forest">
          {info}
        </div>
      )}

      {/* Stage: choose method */}
      {stage === 'choose' && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleApple}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-sans font-semibold text-white shadow-paper disabled:opacity-50"
          >
            <Apple className="h-5 w-5" />
            <span>Sign up with Apple</span>
          </button>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-bridge-stone/30 bg-white px-4 py-3 font-sans font-semibold text-bridge-ink shadow-paper disabled:opacity-50"
          >
            <span className="font-display text-lg leading-none">G</span>
            <span>Sign up with Google</span>
          </button>

          <Divider />

          <button
            type="button"
            onClick={() => setStage('form')}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-bridge-stone/30 bg-white px-4 py-3 font-sans font-semibold text-bridge-ink shadow-paper disabled:opacity-50"
          >
            <Mail className="h-5 w-5" />
            <span>Sign up with Email</span>
          </button>
        </div>
      )}

      {/* Stage: email/password form */}
      {stage === 'form' && (
        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <Field label="Name">
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="form-input"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </Field>
          <Field
            label="Password"
            hint="At least 8 characters, with upper, lower, number, and symbol."
          >
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bridge-navy px-4 py-3 font-sans font-semibold text-white shadow-paper hover:bg-bridge-navy-deep disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
          <button
            type="button"
            onClick={() => {
              setStage('choose');
              setError(null);
            }}
            className="block w-full text-center text-sm text-bridge-stone hover:text-bridge-ink"
          >
            Back to all sign-up options
          </button>
        </form>
      )}

      {/* Stage: confirm code from email */}
      {stage === 'confirm' && (
        <form onSubmit={handleConfirm} className="mt-6 space-y-4">
          <p className="text-sm text-bridge-ink/75">
            We sent a 6-digit code to <span className="font-semibold">{email}</span>. It can take a minute.
          </p>
          <Field label="Verification code">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="form-input tracking-[0.4em] text-center font-display text-xl"
              placeholder="••••••"
            />
          </Field>

          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bridge-navy px-4 py-3 font-sans font-semibold text-white shadow-paper disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm and sign in
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={busy}
              className="font-semibold text-bridge-sky hover:text-bridge-sky/80 disabled:opacity-50"
            >
              Send another code
            </button>
            <button
              type="button"
              onClick={() => {
                setStage('form');
                setCode('');
                setError(null);
                setInfo(null);
              }}
              className="text-bridge-stone hover:text-bridge-ink"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-bridge-stone">
        Already have an account?{' '}
        <Link
          href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-semibold text-bridge-sky"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-8 text-center text-[0.7rem] leading-relaxed text-bridge-stone">
        By creating an account you agree to receive occasional trip-related notices. We don't share your email with anyone.
      </p>

      {/* Inline form-input style — kept here so we don't pollute global CSS */}
      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(154, 147, 127, 0.4);
          background: white;
          padding: 0.55rem 0.75rem;
          font-family: inherit;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s ease;
        }
        :global(.form-input:focus) {
          border-color: #1e3a5f;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-meta">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-xs text-bridge-stone">{hint}</p>}
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-bridge-stone/25" />
      <span className="label-meta">or</span>
      <span className="h-px flex-1 bg-bridge-stone/25" />
    </div>
  );
}
