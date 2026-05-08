import { cn } from '@/lib/utils';
import type { BridgeStatus } from '@/data/bridges-fallback';

interface BridgeStatusBadgeProps {
  status: BridgeStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Rubber-stamp style status badge.
 *
 * Restored bridges get a sage-green "OPEN TO CROSS" stamp.
 * Photograph-only get a rust-colored "VIEW ONLY" stamp.
 * Closed bridges get a stone-gray "CLOSED" stamp.
 *
 * The slight rotation and double-border sell the rubber-stamp effect.
 */
export function BridgeStatusBadge({ status, size = 'md', className }: BridgeStatusBadgeProps) {
  const config = {
    restored: {
      label: 'Open to Cross',
      color: 'border-bridge-forest text-bridge-forest',
    },
    photograph_only: {
      label: 'View Only',
      color: 'border-bridge-rust text-bridge-rust',
    },
    closed: {
      label: 'Closed',
      color: 'border-bridge-stone text-bridge-stone',
    },
  }[status];

  const sizes = {
    sm: 'px-2 py-0.5 text-[0.6rem]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border-2 font-sans font-bold uppercase tracking-small-caps',
        // Double-stamp effect via box-shadow
        'shadow-[inset_0_0_0_1px_currentColor]',
        // Slight rotation feels stamped, not generic
        '-rotate-2',
        config.color,
        sizes[size],
        className,
      )}
      style={{ opacity: 0.92 }}
    >
      {config.label}
    </span>
  );
}
