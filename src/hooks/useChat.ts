'use client';

import { useCallback, useRef, useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatStatus = 'idle' | 'pending' | 'streaming' | 'error';

interface UseChatOptions {
  endpoint?: string;
  initialMessages?: ChatMessage[];
}

/**
 * Manages the chat conversation state and consumes the streaming text
 * response from /api/chat.
 *
 * The API endpoint streams plain UTF-8 text (no SSE, no special framing),
 * so we just decode chunks and append them to the latest assistant message.
 */
export function useChat({ endpoint = '/api/chat', initialMessages = [] }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || status === 'streaming' || status === 'pending') return;

      const userMsg: ChatMessage = { role: 'user', content: content.trim() };
      const placeholderAssistant: ChatMessage = { role: 'assistant', content: '' };

      // Snapshot the conversation before mutating — we need to send THIS list
      // (not the post-update one) to the API so the assistant sees user's last turn.
      const conversation = [...messages, userMsg];

      setMessages([...conversation, placeholderAssistant]);
      setStatus('pending');
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversation }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = `Request failed (${res.status})`;
          try {
            const j = await res.json();
            msg = j.error || msg;
          } catch {
            /* ignore */
          }
          throw new Error(msg);
        }

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (firstChunk) {
            setStatus('streaming');
            firstChunk = false;
          }

          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;

          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: last.content + chunk };
            }
            return next;
          });
        }

        setStatus('idle');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setStatus('idle');
          return;
        }
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        setStatus('error');
        // Remove the empty assistant placeholder so the failed turn doesn't sit there
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.content === '') {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        abortRef.current = null;
      }
    },
    [endpoint, messages, status],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, []);

  return { messages, status, error, sendMessage, stop, reset };
}
