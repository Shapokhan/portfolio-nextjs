// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth'; // ✅ clean import

// Extend NextRequest type to include `auth`
interface AuthenticatedRequest extends NextRequest {
  auth?: any; // you can type this more strictly if you want
}

export default auth((req: AuthenticatedRequest) => {
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
