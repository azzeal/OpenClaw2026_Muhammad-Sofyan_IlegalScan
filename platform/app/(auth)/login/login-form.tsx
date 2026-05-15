'use client';

import { useState, useTransition, use } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const router = useRouter();
  const [error, setError] = useState<string | null>(params.error ?? null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');
    startTransition(async () => {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        setError('Email atau password salah.');
        return;
      }
      router.push(params.next ?? '/dashboard');
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Memproses…' : 'Masuk'}
      </Button>
    </form>
  );
}
