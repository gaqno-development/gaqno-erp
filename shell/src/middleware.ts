import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle auth pages - no profile checks needed
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Protected routes require authentication
  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Fetch profile only for authenticated users on protected routes
  if (user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id, role, is_root_admin, feature_permissions")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!profile.is_root_admin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!profile.tenant_id && !profile.is_root_admin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      const featureRoutes: Record<string, string> = {
        "/dashboard/finance": "FINANCE",
        "/dashboard/crm": "CRM",
        "/dashboard/erp": "ERP",
        "/dashboard/pdv": "PDV",
        "/dashboard/books": "BOOK_CREATOR",
      };

      for (const [routePrefix, featureKey] of Object.entries(featureRoutes)) {
        if (request.nextUrl.pathname.startsWith(routePrefix)) {
          if (!profile.is_root_admin) {
            const featurePerms = profile.feature_permissions as Record<string, any> || {};
            const hasAccess = featurePerms[featureKey] &&
              featurePerms[featureKey].roles &&
              featurePerms[featureKey].roles.length > 0;

            if (!hasAccess) {
              return NextResponse.redirect(new URL("/dashboard", request.url));
            }
          }
          break;
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
