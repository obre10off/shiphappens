import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShipHappens — AI Compliance Screening',
  description:
    'Sanctions, PEP, and adverse media screening in 8 seconds. Audit-ready reports powered by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f172a] text-white antialiased">{children}</body>
    </html>
  );
}
