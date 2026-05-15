import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p);

  if (isProtected && !req.auth) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (isAuthRoute && req.auth) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)'],
};
