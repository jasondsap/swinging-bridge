'use client';

import { Camera, Clock, MapPin, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  {
    icon: Clock,
    title: 'Plan a half-day',
    prompt: 'Plan me a half-day trip from downtown Manchester with 3 bridges and a lunch stop.',
  },
  {
    icon: Users,
    title: 'Best for kids',
    prompt: "I'm visiting with two kids under 10. Which bridges are family-friendly and easy to access?",
  },
  {
    icon: Camera,
    title: 'For photographers',
    prompt: 'Which bridges are most scenic for photography, and what time of day is best?',
  },
  {
    icon: MapPin,
    title: 'Full-day itinerary',
    prompt: "I have a whole day. Build me an itinerary that covers as many bridges as possible with stops to eat.",
  },
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <p className="label-meta text-center">Suggestions</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {PROMPTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => onSelect(p.prompt)}
              className={cn(
                'group flex items-start gap-3 rounded-xl border border-bridge-stone/20 bg-white p-3 text-left shadow-paper transition-all',
                'hover:-translate-y-0.5 hover:border-bridge-sun/50 hover:shadow-paper-hover',
                'animate-fade-up',
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bridge-parchment text-bridge-navy">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-bridge-navy">
                  {p.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-bridge-ink/70">
                  {p.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
