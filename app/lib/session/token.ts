import { createHmac, timingSafeEqual } from "crypto";

/**
 * Shared helpers for the signed `payload.signature` session cookies used by
 * both customer and admin auth. Kept free of `next/headers` so it can run in
 * `proxy.ts` as well as in server components / actions.
 */

export const CUSTOMER_COOKIE = "twc_customer_session";
export const ADMIN_COOKIE = "twc_admin_session";

// Sessions are "sliding": every visit pushes the expiry forward, so people are
// only signed out after this much *inactivity*.
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Avoid re-issuing the cookie on every single request.
export const SESSION_REFRESH_INTERVAL_SECONDS = 60 * 60; // 1 hour

export function getCustomerSessionSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    ""
  );
}

export function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD_SHA256 ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function encodeSessionToken(
  data: Record<string, unknown>,
  secret: string,
  maxAgeSeconds: number
) {
  const payload = Buffer.from(
    JSON.stringify({ ...data, expiresAt: Date.now() + maxAgeSeconds * 1000 })
  ).toString("base64url");

  return `${payload}.${signPayload(payload, secret)}`;
}

/**
 * Returns the decoded payload when the signature is valid and the session has
 * not expired, otherwise `null`.
 */
export function decodeSessionToken<T extends { expiresAt?: number }>(
  token: string | undefined,
  secret: string
): T | null {
  if (!token || !secret) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  if (!safeEqual(signature, signPayload(payload, secret))) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as T;

    if (!data.expiresAt || data.expiresAt < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * If `token` is a valid session that was last issued more than
 * SESSION_REFRESH_INTERVAL_SECONDS ago, returns a freshly signed token with a
 * renewed expiry. Otherwise returns `null` (nothing to do).
 */
export function renewSessionToken(
  token: string | undefined,
  secret: string,
  maxAgeSeconds: number
) {
  const data = decodeSessionToken<{ expiresAt?: number }>(token, secret);

  if (!data?.expiresAt) {
    return null;
  }

  const remainingMs = data.expiresAt - Date.now();
  const refreshThresholdMs =
    (maxAgeSeconds - SESSION_REFRESH_INTERVAL_SECONDS) * 1000;

  if (remainingMs > refreshThresholdMs) {
    return null;
  }

  const { expiresAt: _expiresAt, ...rest } = data;
  void _expiresAt;
  return encodeSessionToken(rest, secret, maxAgeSeconds);
}
