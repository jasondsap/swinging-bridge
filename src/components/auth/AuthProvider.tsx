'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentSession,
  signOut as cognitoSignOut,
} from '@/lib/auth/cognito';
import { configureAmplify } from '@/lib/auth/cognito-config';

interface AppUser {
  sub: string;
  email?: string;
  name?: string;
  // Filled in from /api/auth/me — Payload user with role, etc.
  payloadId?: string | number;
  role?: 'admin' | 'editor' | 'visitor';
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  accessToken: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      configureAmplify();
      const session = await getCurrentSession();
      if (!session) {
        setUser(null);
        setAccessToken(null);
        return;
      }

      setAccessToken(session.accessToken);

      // Fetch the Payload-side user to get role + DB id.
      // /api/auth/me triggers auto-provisioning if first login.
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setUser({
          sub: session.user.userId,
          email: me.email,
          name: me.name,
          payloadId: me.id,
          role: me.role,
        });
      } else {
        // Cognito session valid but Payload sync failed — partial state.
        setUser({
          sub: session.user.userId,
          email: session.user.signInDetails?.loginId,
        });
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await cognitoSignOut();
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, accessToken, refresh, signOut }),
    [user, loading, accessToken, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
