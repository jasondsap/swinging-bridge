import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swingingbridges.app',
  appName: 'Land of Swinging Bridges',
  // For development, point at the Next.js dev server.
  // For production builds, this gets swapped to the deployed Vercel URL via env.
  webDir: 'public',
  server: {
    // In production, set CAPACITOR_SERVER_URL=https://swingingbridges.vercel.app
    // For local dev, you can point at http://10.0.2.2:3000 (Android) or your LAN IP
    url: process.env.CAPACITOR_SERVER_URL || 'https://swingingbridges.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      // iOS Info.plist will need NSLocationWhenInUseUsageDescription set manually
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b7dbf',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
  },
};

export default config;
