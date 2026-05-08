'use client';

import { Map, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'list' | 'map';
  onChange: (view: 'list' | 'map') => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Display mode"
      className={cn(
        'inline-flex rounded-full border border-bridge-stone/30 bg-bridge-parchment p-1',
        className,
      )}
    >
      <ToggleButton selected={view === 'list'} onClick={() => onChange('list')}>
        <List className="h-4 w-4" />
        <span>List</span>
      </ToggleButton>
      <ToggleButton selected={view === 'map'} onClick={() => onChange('map')}>
        <Map className="h-4 w-4" />
        <span>Map</span>
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sans text-sm font-semibold transition-colors',
        selected
          ? 'bg-bridge-navy text-white shadow-paper'
          : 'text-bridge-stone hover:text-bridge-ink',
      )}
    >
      {children}
    </button>
  );
}
