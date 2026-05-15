import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <Card>
      <CardContent className="space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buat akun ClearMark</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Masuk
            </Link>
            .
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-xs text-muted-foreground">
          Trial 14 hari gratis. Tidak butuh kartu kredit. Bisa cancel kapan saja.
        </p>
      </CardContent>
    </Card>
  );
}
