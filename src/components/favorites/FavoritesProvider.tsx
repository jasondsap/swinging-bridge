'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';

export interface FavoriteRecord {
  id: string;
  targetType: 'bridge' | 'place';
  targetId: string;
  bridge?: unknown;
  place?: unknown;
  createdAt?: string;
}

interface FavoritesContextValue {
  favorites: FavoriteRecord[];
  loading: boolean;
  isFavorite: (targetType: 'bridge' | 'place', targetId: string) => boolean;
  /** Optimistic toggle — updates UI immediately, rolls back if API fails. */
  toggle: (targetType: 'bridge' | 'place', targetId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const inflightTogglesRef = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    if (!user || !accessToken) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ favorites: FavoriteRecord[] }>('/api/favorites/me');
      setFavorites(res.favorites);
    } catch {
      // swallow — stale local state is better than blowing up the page
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

  // Refetch whenever the auth state changes (login / logout / token refresh)
  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback(
    (targetType: 'bridge' | 'place', targetId: string) =>
      favorites.some((f) => f.targetType === targetType && f.targetId === targetId),
    [favorites],
  );

  const toggle = useCallback(
    async (targetType: 'bridge' | 'place', targetId: string): Promise<boolean> => {
      if (!user) return false;

      const key = `${targetType}:${targetId}`;
      if (inflightTogglesRef.current.has(key)) return isFavorite(targetType, targetId);
      inflightTogglesRef.current.add(key);

      const wasFavorited = isFavorite(targetType, targetId);
      const willBeFavorited = !wasFavorited;

      // Optimistic update
      setFavorites((prev) => {
        if (wasFavorited) {
          return prev.filter((f) => !(f.targetType === targetType && f.targetId === targetId));
        }
        return [
          ...prev,
          {
            id: `pending-${key}`,
            targetType,
            targetId,
            createdAt: new Date().toISOString(),
          },
        ];
      });

      try {
        const res = await api<{ favorited: boolean; id?: string }>('/api/favorites/toggle', {
          method: 'POST',
          body: { targetType, targetId },
        });

        // Replace the pending entry with the real id if we just created one
        if (res.favorited && res.id) {
          setFavorites((prev) =>
            prev.map((f) =>
              f.id === `pending-${key}` ? { ...f, id: res.id ?? f.id } : f,
            ),
          );
        }
        return res.favorited;
      } catch (err) {
        console.error('[favorites] toggle failed:', err);
        // Roll back the optimistic update
        setFavorites((prev) => {
          if (willBeFavorited) {
            // We added optimistically — remove
            return prev.filter((f) => f.id !== `pending-${key}`);
          }
          // We removed optimistically — restore (refetch is simpler)
          return prev;
        });
        if (!willBeFavorited) {
          // restore by refetching
          refresh();
        }
        return wasFavorited;
      } finally {
        inflightTogglesRef.current.delete(key);
      }
    },
    [user, isFavorite, refresh],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, loading, isFavorite, toggle, refresh }),
    [favorites, loading, isFavorite, toggle, refresh],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used inside a <FavoritesProvider>');
  }
  return ctx;
}
