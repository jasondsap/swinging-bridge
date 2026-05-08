'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';

/**
 * OAuth callback page.
 *
 * After Cognito Hosted UI completes a social sign-in, it redirects the
 * browser here with `?code=...` in the query string. Amplify's Hub picks
 * up the code automatically and finishes the token exchange — we just
 * need to wait for the session to be ready, then refresh our context
 * and bounce the user to where they were going.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    const t = setTimeout(async () => {
      await refresh();
      router.replace('/');
    }, 800); // small delay lets Amplify finish the token exchange
    return () => clearTimeout(t);
  }, [refresh, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-bridge-navy">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-3 text-sm">Signing you in…</p>
    </div>
  );
}
