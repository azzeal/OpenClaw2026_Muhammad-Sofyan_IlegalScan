import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return (
    <Card>
      <CardContent className="space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Masuk ke ClearMark</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Daftar gratis
            </Link>
            .
          </p>
        </div>
        <LoginForm searchParams={searchParams} />
      </CardContent>
    </Card>
  );
}
