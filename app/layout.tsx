import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clavis — AI Compliance Screening',
  description:
    'Sanctions, PEP, and adverse media screening in 8 seconds. Audit-ready reports powered by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
