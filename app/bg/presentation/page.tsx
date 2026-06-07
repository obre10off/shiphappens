import type { Metadata } from 'next';
import PresentationDeck from '@/components/PresentationDeck';
import { bg } from '@/lib/presentation/content';

export const metadata: Metadata = {
  title: 'Clavis — Брифинг за инвеститори и демо',
};

export default function BulgarianPresentation() {
  return <PresentationDeck content={bg} locale="bg" />;
}
