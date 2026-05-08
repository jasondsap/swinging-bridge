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
 * Build a directions URL that opens in the user's preferred maps app.
 *
 * Strategy: use the universal Google Maps URL on web — it works everywhere
 * and respects the user's default app on mobile. For iOS specifically, we
 * could special-case Apple Maps, but in practice the universal link does
 * the right thing in iOS Safari (offers a choice between Maps/Google Maps).
 *
 * On native Capacitor builds, we'll override this to use the geo: scheme
 * (Android) or maps:// scheme (iOS) for a smoother native handoff.
 */
export function directionsUrl(lat: number, lng: number, label?: string): string {
  const q = label ? `${lat},${lng}(${encodeURIComponent(label)})` : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

/**
 * Native maps deep link — used inside Capacitor WebView for iOS/Android.
 * Triggers the OS handoff to Apple Maps / Google Maps.
 */
export function nativeMapsUrl(lat: number, lng: number, label?: string, platform?: 'ios' | 'android' | 'web'): string {
  if (platform === 'ios') {
    const q = label ? `${encodeURIComponent(label)}` : '';
    return `maps://?daddr=${lat},${lng}&q=${q}`;
  }
  if (platform === 'android') {
    return `geo:${lat},${lng}?q=${lat},${lng}${label ? `(${encodeURIComponent(label)})` : ''}`;
  }
  return directionsUrl(lat, lng, label);
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
