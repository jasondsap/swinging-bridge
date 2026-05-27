import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely, deduplicating conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a phone number string into (XXX) XXX-XXXX where possible.
 */
export function formatPhone(raw?: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/**
 * Build a Google Maps directions URL to a coordinate, using the official
 * Maps URLs API. It works everywhere and respects the user's default app on
 * mobile.
 *
 * `destination` must be either a place name OR bare `lat,lng`. Appending a
 * "(Label)" suffix (that's the Android geo: syntax, not the web one) breaks
 * coordinate parsing — Google then geocodes the whole string and lands on the
 * wrong place, so the label is intentionally NOT included here.
 *
 * On native Capacitor builds we override this with the geo:/maps:// schemes
 * (see nativeMapsUrl) for a smoother handoff to the OS maps app.
 */
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Native maps deep link — used inside Capacitor WebView for iOS/Android.
 * Triggers the OS handoff to Apple Maps / Google Maps.
 */
export function nativeMapsUrl(lat: number, lng: number, label?: string, platform?: 'ios' | 'android' | 'web'): string {
  if (platform === 'ios') {
    // Apple Maps: directions to the coordinate. daddr takes a bare lat,lng.
    return `maps://?daddr=${lat},${lng}`;
  }
  if (platform === 'android') {
    // Android geo URI: a labeled pin the user can tap to start directions.
    return `geo:${lat},${lng}?q=${lat},${lng}${label ? `(${encodeURIComponent(label)})` : ''}`;
  }
  return directionsUrl(lat, lng);
}

/**
 * Haversine distance between two coordinates (in miles).
 * Used for "Bridges near me" sorting.
 */
export function haversineMiles(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(aa));
}

/**
 * Format a distance for display: "0.4 mi" or "12 mi"
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
