// components/Markdown.tsx
// A deliberately tiny markdown renderer for report summaries. Supports just what
// the summary needs: paragraphs, short bold headings, bullet lists and **bold**.
// Not a general markdown engine — keep it that way.

import { Fragment } from 'react';

/** Strip stray/unclosed `**` markers (e.g. from a truncated summary) from plain text. */
const cleanStray = (s: string) => s.replace(/\*\*/g, '');

/** Render `**bold**` spans and `[n]` citation links inside a single line of text. */
function inline(
  text: string,
  keyBase: string,
  citationUrl?: (n: number) => string | undefined,
): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {bold[1]}
        </strong>
      );
    }
    const cite = part.match(/^\[(\d+)\]$/);
    if (cite) {
      const n = Number(cite[1]);
      const url = citationUrl?.(n);
      if (url) {
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Source [${n}]`}
            className="align-super text-[10px] font-bold text-accent hover:text-accent-hover"
          >
            [{n}]
          </a>
        );
      }
      return <Fragment key={key}>{part}</Fragment>;
    }
    return <Fragment key={key}>{cleanStray(part)}</Fragment>;
  });
}

const isBullet = (l: string) => /^\s*[-*•]\s+/.test(l);
const isHeading = (l: string) => /^#{1,6}\s+/.test(l) || /^\*\*[^*]+\*\*$/.test(l.trim());

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'para'; lines: string[] };

/** Group lines into headings, bullet lists and paragraphs (handles mixed blocks). */
function groupBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let bullets: string[] = [];

  const flushPara = () => {
    if (para.length) blocks.push({ kind: 'para', lines: para });
    para = [];
  };
  const flushBullets = () => {
    if (bullets.length) blocks.push({ kind: 'bullets', items: bullets });
    bullets = [];
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushBullets();
      continue;
    }
    if (isBullet(line)) {
      flushPara();
      bullets.push(line.replace(/^\s*[-*•]\s+/, ''));
      continue;
    }
    if (isHeading(line)) {
      flushPara();
      flushBullets();
      blocks.push({
        kind: 'heading',
        text: line.replace(/^#{1,6}\s+/, '').replace(/^\*\*([^*]+)\*\*$/, '$1'),
      });
      continue;
    }
    flushBullets();
    para.push(line);
  }
  flushPara();
  flushBullets();
  return blocks;
}

export function Markdown({
  text,
  className,
  citationUrl,
}: {
  text: string;
  className?: string;
  /** Resolve an inline `[n]` citation to a source URL (renders it as a link). */
  citationUrl?: (n: number) => string | undefined;
}) {
  const blocks = groupBlocks(text);

  return (
    <div className={className ?? 'space-y-2.5 text-sm text-ink leading-relaxed'}>
      {blocks.map((block, bi) => {
        if (block.kind === 'heading') {
          return (
            <h4 key={bi} className="text-xs font-bold text-faint uppercase tracking-wider pt-1.5">
              {block.text}
            </h4>
          );
        }
        if (block.kind === 'bullets') {
          return (
            <ul key={bi} className="space-y-1.5 list-none">
              {block.items.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="text-accent mt-px flex-shrink-0">•</span>
                  <span>{inline(l, `${bi}-${li}`, citationUrl)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {block.lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}`, citationUrl)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
