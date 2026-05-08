'use client';

import { Navigation } from 'lucide-react';

import { directionsUrl, nativeMapsUrl, cn } from '@/lib/utils';
import { getPlatform, isNative } from '@/lib/capacitor';

interface DirectionsButtonProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

/**
 * Single-tap "Directions" button.
 *
 * On native platforms, opens the native Maps app (Apple Maps on iOS,
 * Google Maps / default maps app on Android) via the OS handoff scheme.
 * On web, falls back to the universal Google Maps URL.
 */
export function DirectionsButton({
  latitude,
  longitude,
  label,
  className,
  variant = 'primary',
}: DirectionsButtonProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window === 'undefined') return;
    if (!isNative()) return; // let the default href flow handle web

    e.preventDefault();
    const platform = getPlatform();
    const url = nativeMapsUrl(latitude, longitude, label, platform);

    // Use Capacitor's Browser API to open external apps via the URL scheme.
    // Falls back to window.location if the browser plugin isn't loaded.
    import('@capacitor/browser')
      .then(({ Browser }) => Browser.open({ url }))
      .catch(() => {
        window.location.href = url;
      });
  }

  const styles = {
    primary:
      'bg-bridge-navy text-white shadow-paper hover:bg-bridge-navy-deep',
    secondary:
      'border-2 border-bridge-navy text-bridge-navy hover:bg-bridge-navy/5',
  };

  return (
    <a
      href={directionsUrl(latitude, longitude, label)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-sans font-semibold transition-colors',
        styles[variant],
        className,
      )}
    >
      <Navigation className="h-4 w-4" />
      <span>Directions</span>
    </a>
  );
}
