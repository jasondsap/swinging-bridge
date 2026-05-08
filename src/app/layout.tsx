/**
 * Root layout — intentionally minimal.
 *
 * In a Payload + Next.js app, the Payload admin route group provides
 * its own <html>/<body> via @payloadcms/next/layouts.RootLayout.
 * If we ALSO render <html>/<body> here, they nest, which is invalid HTML.
 *
 * Instead, this layout just passes through children. The (frontend)
 * route group provides <html>/<body>/fonts/Tailwind for the consumer
 * app, and the (payload) route group lets Payload's components do the
 * same for the admin.
 *
 * Metadata defined here applies as default; it can be overridden in
 * route-group layouts if needed.
 */
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Land of Swinging Bridges — Clay County, KY',
  description:
    "Discover Clay County, Kentucky's historic swinging bridges, plus local food, lodging, and adventures.",
  manifest: '/manifest.json',
  applicationName: 'Swinging Bridges',
  appleWebApp: {
    capable: true,
    title: 'Swinging Bridges',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e3a5f',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
