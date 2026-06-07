// lib/util/markdown.ts
// Flatten the light markdown used in report summaries back to clean plain text
// (used by the PDF, which renders prose without markdown styling).

export function stripMarkdown(input: string): string {
  return input
    .split(/\n/)
    .map((line) =>
      line
        .replace(/^\s*#{1,6}\s+/, '') // headings
        .replace(/^\s*[-*•]\s+/, '• ') // bullets → simple dot
        .replace(/\*\*(.+?)\*\*/g, '$1') // bold
        .replace(/`([^`]+)`/g, '$1') // inline code
        .trimEnd(),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
