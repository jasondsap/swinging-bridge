'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';

import type { ChatStatus } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  status: ChatStatus;
  onSend: (text: string) => void;
  onStop: () => void;
  placeholder?: string;
  /** External value override (e.g., when a suggested prompt is clicked) */
  prefill?: string;
}

const MAX_ROWS = 5;

export function ChatInput({
  status,
  onSend,
  onStop,
  placeholder = 'Ask about bridges, food, lodging…',
  prefill,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Allow parent to inject a suggested prompt, then immediately submit.
  useEffect(() => {
    if (prefill) setValue(prefill);
  }, [prefill]);

  // Auto-grow up to MAX_ROWS lines
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(ta).lineHeight) || 20;
    const maxHeight = lineHeight * MAX_ROWS + 16;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [value]);

  const isBusy = status === 'streaming' || status === 'pending';
  const canSend = value.trim().length > 0 && !isBusy;

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Desktop: Enter sends, Shift+Enter inserts newline.
    // Mobile: native send is the button — Enter inserts newline (return key).
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (e.key === 'Enter' && isDesktop && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border border-bridge-stone/25 bg-white p-2 shadow-paper focus-within:border-bridge-navy/40 focus-within:shadow-paper-hover"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={status === 'pending'}
        className="flex-1 resize-none border-0 bg-transparent px-2 py-2 font-sans text-base leading-snug text-bridge-ink placeholder:text-bridge-stone focus:outline-none disabled:opacity-50"
        style={{ maxHeight: `${MAX_ROWS * 1.5}rem` }}
      />

      {isBusy ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop generating"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bridge-rust text-white shadow-paper transition-colors hover:bg-bridge-rust/90"
        >
          <Square className="h-3.5 w-3.5 fill-white" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-paper transition-all',
            canSend
              ? 'bg-bridge-navy text-white hover:bg-bridge-navy-deep'
              : 'bg-bridge-stone/30 text-white',
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
