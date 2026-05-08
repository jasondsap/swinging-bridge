'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Compass, RotateCcw, Sparkles } from 'lucide-react';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestedPrompts } from '@/components/chat/SuggestedPrompts';
import { SaveTripDialog } from '@/components/itineraries/SaveTripDialog';
import { useChat, type ChatMessage } from '@/hooks/useChat';

export default function ChatPage() {
  const { messages, status, error, sendMessage, stop, reset } = useChat();
  const [prefill, setPrefill] = useState<string | undefined>();
  const [saveDialog, setSaveDialog] = useState<{ open: boolean; narrative: string; suggested: string }>({
    open: false,
    narrative: '',
    suggested: '',
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  function handleSuggestion(prompt: string) {
    sendMessage(prompt);
    setPrefill(undefined);
  }

  function handleSaveTrip(message: ChatMessage) {
    // Suggest a title from the first user prompt, or fall back to message content
    const firstUserPrompt = messages.find((m) => m.role === 'user')?.content ?? '';
    setSaveDialog({
      open: true,
      narrative: message.content,
      suggested: firstUserPrompt,
    });
  }

  const isStreaming = status === 'streaming' || status === 'pending';
  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      {!isEmpty && (
        <div className="container-app sticky top-[57px] z-30 flex items-center justify-between border-b border-bridge-stone/15 bg-bridge-paper/95 py-2 backdrop-blur">
          <p className="label-meta">AI Trip Guide</p>
          <button
            type="button"
            onClick={reset}
            disabled={isStreaming}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-bridge-stone hover:bg-bridge-parchment hover:text-bridge-ink disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" />
            New chat
          </button>
        </div>
      )}

      <div ref={scrollRef} className="container-app flex-1 py-4">
        {isEmpty ? (
          <EmptyState onSelect={handleSuggestion} />
        ) : (
          <div className="space-y-4 pb-32">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const isLastAssistant = isLast && msg.role === 'assistant';
              const isSaveable =
                msg.role === 'assistant' &&
                !isStreaming &&
                looksLikeTripPlan(msg.content);

              return (
                <div key={i} className="space-y-2">
                  <ChatBubble message={msg} streaming={isStreaming && isLastAssistant} />
                  {isSaveable && (
                    <div className="flex justify-start pl-10">
                      <button
                        type="button"
                        onClick={() => handleSaveTrip(msg)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-bridge-navy/20 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-bridge-navy shadow-paper transition-all hover:bg-bridge-navy hover:text-white"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        Save this trip
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {error && (
              <div className="rounded-xl border border-bridge-rust/30 bg-bridge-rust/5 px-4 py-3 text-sm text-bridge-rust">
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div
        className="fixed inset-x-0 z-40 border-t border-bridge-stone/15 bg-bridge-paper/95 backdrop-blur"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 60px)' }}
      >
        <div className="container-app py-2.5">
          <ChatInput status={status} onSend={sendMessage} onStop={stop} prefill={prefill} />
        </div>
      </div>

      <SaveTripDialog
        open={saveDialog.open}
        onClose={() => setSaveDialog((s) => ({ ...s, open: false }))}
        narrative={saveDialog.narrative}
        suggestedTitle={saveDialog.suggested}
      />
    </div>
  );
}

/**
 * Heuristic: does this assistant message look like a trip plan worth saving?
 *
 * We don't want a "Save trip" button on every casual response (e.g.,
 * "What's the longest bridge?" → one-sentence answer). Trip plans tend to
 * have headers, multiple sections, or numbered/bulleted stops.
 */
function looksLikeTripPlan(content: string): boolean {
  if (content.length < 200) return false;
  const hasHeading = /^#{1,3}\s+/m.test(content);
  const hasMultipleBullets = (content.match(/^[\s]*[-*]\s+/gm) || []).length >= 3;
  const hasNumberedList = (content.match(/^\s*\d+\.\s+/gm) || []).length >= 3;
  const hasDayMarker = /\b(morning|afternoon|evening|day\s*\d|stop\s*\d)\b/i.test(content);
  return hasHeading || hasMultipleBullets || hasNumberedList || hasDayMarker;
}

function EmptyState({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center pb-32">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-bridge-sun bg-bridge-navy text-bridge-sun shadow-paper">
          <Compass className="h-6 w-6" />
        </div>
        <p className="label-meta mt-4 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          AI Trip Guide
        </p>
        <h1
          className="mt-2 font-display text-2xl font-bold text-bridge-navy"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Plan your <span className="underline-stroke">visit</span>.
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-bridge-ink/75">
          I can help you map out a trip across Clay County's swinging bridges with stops to eat, sleep, and explore.
        </p>
      </div>

      <div className="mt-8 w-full max-w-md">
        <SuggestedPrompts onSelect={onSelect} />
      </div>

      <p className="mt-6 max-w-sm px-4 text-center text-[0.7rem] leading-relaxed text-bridge-stone">
        Pulls live information from our directory of bridges, restaurants, and lodging. May occasionally make mistakes — verify details before heading out.
      </p>
    </div>
  );
}
