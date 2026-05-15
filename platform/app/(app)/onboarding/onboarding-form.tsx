'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      brand: String(fd.get('brand') ?? ''),
      nie: String(fd.get('nie') ?? '') || undefined,
      referenceImageUrl: String(fd.get('referenceImageUrl') ?? '') || undefined,
      keywords: String(fd.get('keywords') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    startTransition(async () => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Gagal menyimpan produk.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama produk *</Label>
        <Input id="name" name="name" required placeholder="mis. Viagra 100 mg" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="brand">Brand / pendaftar (opsional)</Label>
        <Input id="brand" name="brand" placeholder="mis. Pfizer Indonesia" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nie">Nomor Izin Edar / NIE (opsional)</Label>
        <Input id="nie" name="nie" placeholder="mis. DKI1690401417B1" />
        <p className="text-xs text-muted-foreground">Jika produk obat / kosmetik terdaftar BPOM.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="keywords">Kata kunci tambahan (pisahkan dengan koma)</Label>
        <Input
          id="keywords"
          name="keywords"
          placeholder="mis. obat kuat, v14gra, 500 mg, vgr4"
        />
        <p className="text-xs text-muted-foreground">
          Variasi penyamaran nama, dosis tidak masuk akal, atau istilah yang sering dipakai penjual ilegal.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="referenceImageUrl">Foto kemasan referensi (URL, opsional)</Label>
        <Input id="referenceImageUrl" name="referenceImageUrl" type="url" placeholder="https://…" />
        <p className="text-xs text-muted-foreground">
          Upload langsung akan tersedia setelah integrasi storage. Untuk sekarang: paste URL gambar (Imgur, GitHub, dll).
        </p>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Menyimpan…' : 'Simpan & mulai pantau'}
      </Button>
    </form>
  );
}
