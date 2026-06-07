import type { Metadata } from 'next';
import PresentationDeck from '@/components/PresentationDeck';
import { en } from '@/lib/presentation/content';

export const metadata: Metadata = {
  title: 'Clavis — Investor & demo briefing',
};

export default function EnglishPresentation() {
  return <PresentationDeck content={en} locale="en" />;
}
