import Link from 'next/link';
import { ArrowRight, MessageSquare, MapPin, Utensils, Bed } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-bridge-navy to-bridge-sky px-4 py-10 text-white">
        <div className="container-app">
          <p className="text-sm font-semibold uppercase tracking-wide text-bridge-sun">
            Clay County, Kentucky
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
            Swinging Bridges of Clay County
          </h1>
          <p className="mt-3 text-bridge-mist">
            Seven restored bridges, miles of mountain rivers, and the romance of Appalachian
            history — all in one day's drive.
          </p>
          <Link
            href="/bridges"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-bridge-sun px-5 py-2.5 font-semibold text-bridge-navy shadow-md"
          >
            Explore the bridges <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Quick action grid */}
      <section className="container-app py-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Plan your visit</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            href="/chat"
            icon={<MessageSquare className="h-5 w-5" />}
            title="Ask the AI Guide"
            subtitle="Plan a custom trip"
          />
          <QuickAction
            href="/bridges"
            icon={<MapPin className="h-5 w-5" />}
            title="Bridge Map"
            subtitle="Find them all"
          />
          <QuickAction
            href="/places?filter=eat"
            icon={<Utensils className="h-5 w-5" />}
            title="Where to Eat"
            subtitle="Local favorites"
          />
          <QuickAction
            href="/places?filter=stay"
            icon={<Bed className="h-5 w-5" />}
            title="Where to Stay"
            subtitle="Hotels & rentals"
          />
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-bridge-mist bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bridge-mist text-bridge-navy">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-bridge-navy">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </Link>
  );
}
