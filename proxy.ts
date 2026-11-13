import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  CUSTOMER_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  getAdminSessionSecret,
  getCustomerSessionSecret,
  renewSessionToken,
  sessionCookieOptions,
} from "@/app/lib/session/token";

/**
 * Sliding sessions: whenever a signed-in customer or admin visits the site,
 * push their session expiry forward so active users are never logged out
 * mid-use. Only idle sessions expire.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const sessions = [
    {
      name: CUSTOMER_COOKIE,
      secret: getCustomerSessionSecret(),
      maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    },
    {
      name: ADMIN_COOKIE,
      secret: getAdminSessionSecret(),
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    },
  ];

  for (const { name, secret, maxAge } of sessions) {
    const renewed = renewSessionToken(
      request.cookies.get(name)?.value,
      secret,
      maxAge
    );

    if (renewed) {
      response.cookies.set(name, renewed, sessionCookieOptions(maxAge));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Page and server-action requests only; skip static assets and images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$).*)",
  ],
};
