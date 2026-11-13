import { cookies } from "next/headers";
import { getCustomerById } from "@/app/lib/customer/users/data";
import type { CustomerSessionUser } from "@/app/lib/customer/types";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  decodeSessionToken,
  encodeSessionToken,
  getCustomerSessionSecret as getSessionSecret,
  sessionCookieOptions,
} from "@/app/lib/session/token";

type CustomerSession =
  | ({ isAuthenticated: true } & CustomerSessionUser)
  | { isAuthenticated: false };

export function isCustomerAuthConfigured() {
  return Boolean(getSessionSecret() && process.env.DATABASE_URL);
}

export async function createCustomerSession(user: CustomerSessionUser) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Customer auth is not configured.");
  }

  const token = encodeSessionToken(
    {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
    secret,
    CUSTOMER_SESSION_MAX_AGE_SECONDS
  );

  (await cookies()).set(
    CUSTOMER_COOKIE,
    token,
    sessionCookieOptions(CUSTOMER_SESSION_MAX_AGE_SECONDS)
  );
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function verifyCustomerSession(): Promise<CustomerSession> {
  const secret = getSessionSecret();

  if (!secret) {
    return { isAuthenticated: false };
  }

  const session = decodeSessionToken<{
    userId?: string;
    email?: string;
    expiresAt?: number;
  }>((await cookies()).get(CUSTOMER_COOKIE)?.value, secret);

  if (!session?.userId || !session.email) {
    return { isAuthenticated: false };
  }

  try {
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
      billingAddress: user.billingAddress,
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
