'use client';

import { useEffect, useState } from 'react';

/**
 * Typewriter text. Reveals `text` character-by-character on mount — paired with
 * a `key` on the parent slide it re-streams on every slide entry, reading like
 * the agent "typing" its analysis.
 *
 * Reflow-safe: a full, invisible copy of the text is stacked in the same grid
 * cell so the box is sized to the final text and never jumps as it fills.
 * Honors `prefers-reduced-motion` (shows the full text immediately).
 */
export function StreamingText({
  text,
  className = '',
  speed = 18,
  startDelay = 0,
  caret = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  caret?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReduced(true);
      setCount(text.length);
      return;
    }

    setCount(0);
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  const done = count >= text.length;

  return (
    <span className={`grid ${className}`}>
      <span aria-hidden className="invisible whitespace-pre-line [grid-area:1/1]">
        {text}
      </span>
      <span aria-hidden className="whitespace-pre-line [grid-area:1/1]">
        {text.slice(0, count)}
        {caret && !reduced && !done && (
          <span className="ml-1 inline-block h-[0.82em] w-[3px] translate-y-[0.08em] animate-pulse rounded-sm bg-accent align-middle" />
        )}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
