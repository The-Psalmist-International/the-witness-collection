import { cookies } from "next/headers";
import type { AdminRole } from "@/app/lib/admin/roles";
import { bootstrapAdminUser } from "@/app/lib/admin/users/seed";
import {
  authenticateAdminLogin,
  getAdminUserById,
} from "@/app/lib/admin/users/data";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  decodeSessionToken,
  encodeSessionToken,
  getAdminSessionSecret as getSessionSecret,
  sessionCookieOptions,
} from "@/app/lib/session/token";

export type AdminSessionUser = {
  userId: string;
  email: string;
  role: AdminRole;
  status: "active" | "suspended";
  mustResetPassword: boolean;
};

type AdminSession =
  | ({ isAuthenticated: true; isConfigured: true } & AdminSessionUser)
  | { isAuthenticated: false; isConfigured: boolean };

export function isAdminConfigured() {
  return Boolean(getSessionSecret() && process.env.DATABASE_URL);
}

async function ensureBootstrap() {
  try {
    await bootstrapAdminUser();
  } catch {
    return false;
  }

  return true;
}

export async function validateAdminCredentials(email: string, password: string) {
  await ensureBootstrap();
  const result = await authenticateAdminLogin(email, password);
  return result.ok ? result.user : null;
}

export async function createAdminSession(user: AdminSessionUser) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Admin auth is not configured.");
  }

  const token = encodeSessionToken(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      status: user.status,
      mustResetPassword: user.mustResetPassword,
    },
    secret,
    ADMIN_SESSION_MAX_AGE_SECONDS
  );

  (await cookies()).set(
    ADMIN_COOKIE,
    token,
    sessionCookieOptions(ADMIN_SESSION_MAX_AGE_SECONDS)
  );
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function verifyAdminSession(): Promise<AdminSession> {
  const secret = getSessionSecret();
  const isConfigured = Boolean(secret && process.env.DATABASE_URL);

  if (!secret) {
    return { isAuthenticated: false, isConfigured: false };
  }

  const cookieValue = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!cookieValue) {
    return { isAuthenticated: false, isConfigured };
  }

  const session = decodeSessionToken<{
    userId?: string;
    email?: string;
    role?: AdminRole;
    expiresAt?: number;
  }>(cookieValue, secret);

  if (!session?.userId || !session.email || !session.role) {
    return { isAuthenticated: false, isConfigured: true };
  }

  let user = null;

  try {
    user = await getAdminUserById(session.userId);
  } catch {
    return { isAuthenticated: false, isConfigured };
  }

  if (!user || user.status !== "active") {
    return { isAuthenticated: false, isConfigured };
  }

  return {
    isAuthenticated: true,
    isConfigured: true,
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    mustResetPassword: user.mustResetPassword,
  };
}

export async function requireAdminSession() {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    throw new Error("Unauthorized");
  }

  return session;
}
