'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Compass } from 'lucide-react';
import Link from 'next/link';

import type { ChatMessage } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessage;
  /** True if this is the most recent assistant message and it's still streaming */
  streaming?: boolean;
}

export function ChatBubble({ message, streaming }: ChatBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-bridge-navy px-4 py-2.5 font-sans text-white shadow-paper">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant
  return (
    <div className="flex items-start gap-2.5">
      {/* Avatar */}
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-bridge-sun bg-bridge-navy text-bridge-sun shadow-paper">
        <Compass className="h-4 w-4" />
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[88%] rounded-2xl rounded-bl-md border border-bridge-stone/15 bg-white px-4 py-3 shadow-paper',
          streaming && 'ring-1 ring-bridge-sun/30',
        )}
      >
        {message.content === '' ? (
          <ThinkingDots />
        ) : (
          <div className="prose-chat">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-bridge-navy">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-bridge-ink/90">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 ml-1 list-disc space-y-1 pl-4 marker:text-bridge-sun last:mb-0">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 ml-1 list-decimal space-y-1 pl-4 marker:text-bridge-sun last:mb-0">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-3 font-display text-base font-semibold text-bridge-navy first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-1.5 mt-2.5 font-display text-sm font-semibold text-bridge-navy first:mt-0">
                    {children}
                  </h3>
                ),
                a: ({ href, children }) => {
                  // Internal bridge/place links → use Next.js client navigation
                  if (href?.startsWith('/')) {
                    return (
                      <Link href={href} className="text-bridge-sky underline-stroke">
                        {children}
                      </Link>
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bridge-sky underline-stroke"
                    >
                      {children}
                    </a>
                  );
                },
                code: ({ children }) => (
                  <code className="rounded bg-bridge-parchment px-1 py-0.5 font-mono text-[0.85em] text-bridge-navy">
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-2 border-l-2 border-bridge-sun pl-3 italic text-bridge-ink/85">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {streaming && (
              <span
                className="ml-0.5 inline-block h-4 w-[2px] -translate-y-[2px] animate-pulse bg-bridge-navy align-middle"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-bridge-stone/60"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}
