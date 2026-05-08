/**
 * Capacitor platform helpers.
 *
 * The same React component runs in three contexts:
 *   1. A web browser (mobile or desktop)
 *   2. An iOS native shell (Capacitor WebView)
 *   3. An Android native shell (Capacitor WebView)
 *
 * Use these helpers to gracefully degrade — never assume a Capacitor plugin
 * exists. On the web build, they simply return `null` or fall back to web APIs.
 */

import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';

export const getPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'web'; // SSR
  return Capacitor.getPlatform() as Platform;
};

export const isNative = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform();
};

/**
 * Get current GPS position. Uses Capacitor's plugin natively, browser API on web.
 */
export async function getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof window === 'undefined') return null;

  if (isNative()) {
    const { Geolocation } = await import('@capacitor/geolocation');
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location !== 'granted') return null;
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  }

  // Web fallback
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/**
 * Persistent key/value storage. Uses Capacitor Preferences natively (more reliable
 * than localStorage in WebView), localStorage on web.
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value;
    }
    return window.localStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
      return;
    }
    window.localStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
      return;
    }
    window.localStorage.removeItem(key);
  },
};

/**
 * Register the device for push notifications (native only).
 * Returns the device token if successful.
 */
export async function registerPushNotifications(): Promise<string | null> {
  if (!isNative()) return null;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  const perm = await PushNotifications.checkPermissions();
  if (perm.receive !== 'granted') {
    const req = await PushNotifications.requestPermissions();
    if (req.receive !== 'granted') return null;
  }

  return new Promise((resolve) => {
    PushNotifications.addListener('registration', (token) => {
      resolve(token.value);
    });
    PushNotifications.addListener('registrationError', () => {
      resolve(null);
    });
    PushNotifications.register();
  });
}
