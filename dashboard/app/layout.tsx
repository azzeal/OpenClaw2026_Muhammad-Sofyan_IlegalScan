import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClearMark · Mission Control',
  description:
    "Cockpit for OpenClaw's three-agent counterfeit detection system. Real-time view of Scanner, Intake, and Analyst.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
