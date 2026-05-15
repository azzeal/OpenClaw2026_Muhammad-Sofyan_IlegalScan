'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function RunScanButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function go() {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch('/api/scans/run', { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        summary?: { totalFindings: number; durationMs: number };
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setMsg(`Gagal: ${json.error ?? 'unknown error'}`);
        return;
      }
      setMsg(
        `Selesai: ${json.summary?.totalFindings ?? 0} temuan baru dalam ${json.summary?.durationMs ?? 0}ms.`,
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={go} disabled={pending} className="w-full">
        {pending ? 'Memindai marketplace…' : 'Jalankan scan sekarang'}
      </Button>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      <p className="text-xs text-muted-foreground">
        Memicu scan manual ke Shopee + Tokopedia + TikTok Shop untuk semua produk aktif. Jadwal otomatis (tiap 6 jam) tetap berjalan di latar belakang.
      </p>
    </div>
  );
}
