import { Bed, Building2, Camera, Mountain, Tent, Trees, Utensils } from 'lucide-react';

import type { PlaceType } from '@/data/places-fallback';
import { cn } from '@/lib/utils';

interface PlaceTypeBadgeProps {
  type: PlaceType;
  size?: 'sm' | 'md';
  className?: string;
}

const TYPE_CONFIG: Record<
  PlaceType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  restaurant: { label: 'Restaurant', icon: Utensils, color: 'text-bridge-rust border-bridge-rust' },
  hotel: { label: 'Hotel', icon: Bed, color: 'text-bridge-navy border-bridge-navy' },
  rental: { label: 'Rental', icon: Bed, color: 'text-bridge-navy border-bridge-navy' },
  campground: { label: 'Campground', icon: Tent, color: 'text-bridge-forest border-bridge-forest' },
  attraction: { label: 'Attraction', icon: Camera, color: 'text-bridge-sun-deep border-bridge-sun-deep' },
  outdoor: { label: 'Outdoor', icon: Mountain, color: 'text-bridge-forest border-bridge-forest' },
  museum: { label: 'Museum', icon: Building2, color: 'text-bridge-timber border-bridge-timber' },
  shopping: { label: 'Shopping', icon: Trees, color: 'text-bridge-stone border-bridge-stone' },
  service: { label: 'Service', icon: Trees, color: 'text-bridge-stone border-bridge-stone' },
};

export function PlaceTypeBadge({ type, size = 'md', className }: PlaceTypeBadgeProps) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.attraction;
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border bg-white/95 font-sans font-bold uppercase tracking-small-caps backdrop-blur',
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.6rem]' : 'px-2 py-1 text-xs',
        cfg.color,
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      <span>{cfg.label}</span>
    </span>
  );
}

export { TYPE_CONFIG as PLACE_TYPE_CONFIG };
