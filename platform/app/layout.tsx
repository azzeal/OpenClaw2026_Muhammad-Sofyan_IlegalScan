import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClearMark — pantau brand kamu dari produk tiruan',
  description:
    'Platform SaaS yang otomatis memindai Shopee, Tokopedia, dan TikTok Shop untuk listing palsu brand kamu. Laporan harian, notifikasi Telegram, langsung pakai.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
