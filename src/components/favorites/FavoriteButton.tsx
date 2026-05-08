'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { useFavorites } from '@/components/favorites/FavoritesProvider';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  targetType: 'bridge' | 'place';
  targetId: string;
  /** Optional — improves the post-login redirect experience */
  returnTo?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'pill';
  className?: string;
  /** Label shown next to the heart in pill variant */
  label?: string;
}

const SIZES = {
  sm: { btn: 'h-7 w-7', icon: 'h-3.5 w-3.5' },
  md: { btn: 'h-9 w-9', icon: 'h-4 w-4' },
  lg: { btn: 'h-10 w-10', icon: 'h-5 w-5' },
};

export function FavoriteButton({
  targetType,
  targetId,
  returnTo,
  size = 'md',
  variant = 'icon',
  className,
  label,
}: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const [showSignInHint, setShowSignInHint] = useState(false);

  const favorited = isFavorite(targetType, targetId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Unauthenticated — show inline hint, then route to login on second tap
      if (!showSignInHint) {
        setShowSignInHint(true);
        setTimeout(() => setShowSignInHint(false), 3000);
        return;
      }
      const back = returnTo || pathname || '/';
      router.push(`/login?redirect=${encodeURIComponent(back)}`);
      return;
    }

    await toggle(targetType, targetId);
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={favorited}
        aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-sans text-sm font-semibold shadow-paper transition-all',
          favorited
            ? 'border-bridge-rust bg-white text-bridge-rust'
            : 'border-bridge-navy text-bridge-navy hover:bg-bridge-navy/5',
          className,
        )}
      >
        <Heart className={cn(SIZES[size].icon, favorited && 'fill-bridge-rust')} />
        <span>{label ?? (favorited ? 'Saved' : 'Save')}</span>
      </button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={favorited}
        aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        className={cn(
          SIZES[size].btn,
          'inline-flex items-center justify-center rounded-full border-2 shadow-paper transition-all',
          favorited
            ? 'border-bridge-rust bg-white text-bridge-rust'
            : 'border-white/80 bg-white/85 text-bridge-stone hover:text-bridge-navy backdrop-blur',
        )}
      >
        <Heart
          className={cn(
            SIZES[size].icon,
            favorited && 'fill-bridge-rust',
            'transition-transform',
            favorited && 'scale-110',
          )}
        />
      </button>

      {showSignInHint && (
        <div
          role="status"
          className="absolute right-0 top-full z-30 mt-2 w-44 animate-fade-up rounded-lg bg-bridge-ink px-3 py-2 text-xs text-white shadow-paper-hover"
        >
          Sign in to save favorites. Tap again to go to login.
          <span className="absolute -top-1 right-3 h-2 w-2 rotate-45 bg-bridge-ink" />
        </div>
      )}
    </div>
  );
}
