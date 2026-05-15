'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get('fullName') ?? ''),
      brandName: String(fd.get('brandName') ?? ''),
      email: String(fd.get('email') ?? ''),
      password: String(fd.get('password') ?? ''),
    };
    startTransition(async () => {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Pendaftaran gagal.');
        return;
      }
      const r = await signIn('credentials', {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
      if (r?.error) {
        setError('Akun dibuat, tapi login otomatis gagal. Coba masuk manual.');
        return;
      }
      router.push('/onboarding');
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
        <Label htmlFor="fullName">Nama kamu</Label>
        <Input id="fullName" name="fullName" required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="brandName">Nama brand</Label>
        <Input id="brandName" name="brandName" required placeholder="mis. Pfizer Indonesia, Wardah, Skintific" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email kerja</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password (min 8 karakter)</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Membuat akun…' : 'Daftar & mulai trial'}
      </Button>
    </form>
  );
}
