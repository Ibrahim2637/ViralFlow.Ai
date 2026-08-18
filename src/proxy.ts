import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isValidUrl = !!(supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')));

  // If Supabase is not configured yet (local dev placeholder mode), bypass route guards to allow development
  if (!isValidUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase credentials missing. Bypassing middleware auth guards for development.");
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Retrieve user session
  const { data: { session } } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Define route lists
  const isAuthRoute = path === '/login' || path === '/signup';
  const isSuspendedRoute = path === '/account-suspended';
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/editor') || 
    path.startsWith('/admin') || 
    path.startsWith('/onboarding');
  
  const isAdminRoute = path.startsWith('/admin');

  // 1. Not logged in:
  if (!session) {
    if (isProtectedRoute && !isAuthRoute) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 2. Logged in - Fetch creator profile from Supabase
  try {
    const { data: profile, error } = await supabase
      .from('creators')
      .select('role, status')
      .eq('id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching creator profile in middleware:", error);
    }

    const userStatus = profile?.status || 'active';
    const userRole = profile?.role || 'creator';

    // A. Check for suspension
    if (userStatus === 'suspended') {
      if (!isSuspendedRoute && path !== '/login') {
        url.pathname = '/account-suspended';
        return NextResponse.redirect(url);
      }
      return response;
    }

    // If suspended route is accessed by an active user, send them to dashboard
    if (isSuspendedRoute && userStatus === 'active') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // B. Check for Admin role authorization
    if (isAdminRoute && userRole !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // C. If user is logged in & active, prevent accessing auth pages
    if (isAuthRoute) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

  } catch (err) {
    console.error("Middleware profile fetch exception:", err);
  }

  return response;
}

// Config to specify which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - next.svg, vercel.svg (default asset files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
