import Link from 'next/link';
import { Fraunces, Manrope } from 'next/font/google';
import { Compass, MapPin, MessageSquare, Route, User } from 'lucide-react';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { FavoritesProvider } from '@/components/favorites/FavoritesProvider';

import '../globals.css';

// Fonts and Tailwind belong to the consumer app only — Payload's admin
// has its own styling system and shouldn't inherit these.
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <AuthProvider>
          <FavoritesProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-40 border-b border-bridge-mist bg-bridge-navy text-white">
                <div className="container-app flex items-center justify-between py-3">
                  <Link href="/" className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-bridge-sun" />
                    <span className="font-display text-lg font-semibold">
                      Swinging Bridges
                    </span>
                  </Link>
                </div>
              </header>

              <main className="flex-1 pb-20">{children}</main>

              <nav
                className="fixed bottom-0 left-0 right-0 z-50 border-t border-bridge-mist bg-white"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <div className="container-app flex items-center justify-around py-2">
                  <TabLink href="/" icon={<Compass className="h-5 w-5" />} label="Explore" />
                  <TabLink href="/bridges" icon={<MapPin className="h-5 w-5" />} label="Bridges" />
                  <TabLink href="/chat" icon={<MessageSquare className="h-5 w-5" />} label="Plan" />
                  <TabLink href="/trip" icon={<Route className="h-5 w-5" />} label="Trips" />
                  <TabLink href="/profile" icon={<User className="h-5 w-5" />} label="Me" />
                </div>
              </nav>
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function TabLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-bridge-navy hover:text-bridge-sky"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
