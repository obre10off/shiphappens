import { redirect } from 'next/navigation';

/** Canonical deck lives at /en/presentation (with a Bulgarian copy at /bg/presentation). */
export default function PresentationIndex() {
  redirect('/en/presentation');
}
