import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getCustomerById } from "@/app/lib/customer/users/data";
import type { CustomerSessionUser } from "@/app/lib/customer/types";

const CUSTOMER_COOKIE = "twc_customer_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type CustomerSession =
  | ({ isAuthenticated: true } & CustomerSessionUser)
  | { isAuthenticated: false };

function getSessionSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
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

export function isCustomerAuthConfigured() {
  return Boolean(getSessionSecret() && process.env.DATABASE_URL);
}

export async function createCustomerSession(user: CustomerSessionUser) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Customer auth is not configured.");
  }

  const payload = Buffer.from(
    JSON.stringify({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    })
  ).toString("base64url");
  const signature = signPayload(payload, secret);

  (await cookies()).set(CUSTOMER_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function verifyCustomerSession(): Promise<CustomerSession> {
  const secret = getSessionSecret();

  if (!secret) {
    return { isAuthenticated: false };
  }

  const cookieValue = (await cookies()).get(CUSTOMER_COOKIE)?.value;

  if (!cookieValue) {
    return { isAuthenticated: false };
  }

  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return { isAuthenticated: false };
  }

  const expectedSignature = signPayload(payload, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return { isAuthenticated: false };
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      userId?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      expiresAt?: number;
    };

    if (
      !session.userId ||
      !session.email ||
      !session.firstName ||
      !session.lastName ||
      !session.phone ||
      !session.expiresAt ||
      session.expiresAt < Date.now()
    ) {
      return { isAuthenticated: false };
    }

    const user = await getCustomerById(session.userId);

    if (!user || user.status !== "active") {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  } catch {
    return { isAuthenticated: false };
  }
}

export async function requireCustomerSession() {
  const session = await verifyCustomerSession();

  if (!session.isAuthenticated) {
    throw new Error("Customer authentication required.");
  }

  return session;
}
