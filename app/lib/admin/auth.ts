import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AdminRole } from "@/app/lib/admin/roles";
import { bootstrapAdminUser } from "@/app/lib/admin/users/seed";
import {
  authenticateAdminLogin,
  getAdminUserById,
} from "@/app/lib/admin/users/data";

const ADMIN_COOKIE = "twc_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

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

function getSessionSecret() {
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

  const payload = Buffer.from(
    JSON.stringify({
      userId: user.userId,
      email: user.email,
      role: user.role,
      status: user.status,
      mustResetPassword: user.mustResetPassword,
      expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    })
  ).toString("base64url");
  const signature = signPayload(payload, secret);

  (await cookies()).set(ADMIN_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
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

  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return { isAuthenticated: false, isConfigured: true };
  }

  const expectedSignature = signPayload(payload, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return { isAuthenticated: false, isConfigured: true };
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      userId?: string;
      email?: string;
      role?: AdminRole;
      status?: "active" | "suspended";
      mustResetPassword?: boolean;
      expiresAt?: number;
    };

    if (
      !session.userId ||
      !session.email ||
      !session.role ||
      !session.expiresAt ||
      session.expiresAt < Date.now()
    ) {
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
  } catch {
    return { isAuthenticated: false, isConfigured: true };
  }
}

export async function requireAdminSession() {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    throw new Error("Unauthorized");
  }

  return session;
}
