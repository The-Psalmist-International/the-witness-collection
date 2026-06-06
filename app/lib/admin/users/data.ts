import { count, desc, eq } from "drizzle-orm";
import { ADMIN_PAGE_SIZE } from "@/app/lib/admin/pagination";
import {
  generateResetToken,
  generateTemporaryPassword,
  hashPassword,
  hashToken,
  verifyPassword,
} from "@/app/lib/admin/password";
import type { AdminRole } from "@/app/lib/admin/roles";
import { getDb } from "@/app/lib/db";
import { adminPasswordTokens, adminUsers } from "@/app/lib/db/schema";

export type AdminUserRecord = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: AdminRole;
  status: "active" | "suspended";
  mustResetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export function getAdminUserDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email;
}

function mapUser(row: typeof adminUsers.$inferSelect): AdminUserRecord {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    role: row.role as AdminRole,
    status: row.status as "active" | "suspended",
    mustResetPassword: row.mustResetPassword,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastLoginAt: row.lastLoginAt,
  };
}

export async function getAdminUserByEmail(email: string) {
  const [row] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.trim().toLowerCase()))
    .limit(1);

  return row ? mapUser(row) : null;
}

export async function getAdminUserById(userId: string) {
  const [row] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);

  return row ? mapUser(row) : null;
}

export async function getAdminUserWithPasswordByEmail(email: string) {
  const [row] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.trim().toLowerCase()))
    .limit(1);

  return row ?? null;
}

export async function verifyAdminUserCredentials(email: string, password: string) {
  const result = await authenticateAdminLogin(email, password);
  return result.ok ? result.user : null;
}

export async function authenticateAdminLogin(email: string, password: string) {
  const row = await getAdminUserWithPasswordByEmail(email);

  if (!row) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (!verifyPassword(password, row.passwordHash)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (row.status === "suspended") {
    return { ok: false as const, reason: "suspended" as const };
  }

  return { ok: true as const, user: mapUser(row) };
}

export async function updateAdminLastLogin(userId: string) {
  await getDb()
    .update(adminUsers)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(adminUsers.id, userId));
}

export async function listAdminUsersPaginated(
  page: number,
  pageSize = ADMIN_PAGE_SIZE
) {
  const totalResult = await getDb().select({ total: count() }).from(adminUsers);
  const totalItems = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = await getDb()
    .select()
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items: rows.map(mapUser),
    totalItems,
    pageSize,
    currentPage,
    totalPages,
  };
}

export async function createAdminUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: AdminRole;
  createdBy: string;
}) {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = hashPassword(temporaryPassword);

  const [row] = await getDb()
    .insert(adminUsers)
    .values({
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      passwordHash,
      role: input.role,
      status: "active",
      mustResetPassword: true,
      createdBy: input.createdBy,
    })
    .returning();

  return {
    user: mapUser(row),
    temporaryPassword,
  };
}

export async function setAdminUserStatus(
  userId: string,
  status: "active" | "suspended"
) {
  const [row] = await getDb()
    .update(adminUsers)
    .set({ status, updatedAt: new Date() })
    .where(eq(adminUsers.id, userId))
    .returning();

  if (!row) {
    throw new Error("User not found.");
  }

  return mapUser(row);
}

export async function updateAdminUserPassword(
  userId: string,
  password: string,
  options?: { clearMustReset?: boolean }
) {
  const passwordHash = hashPassword(password);

  const [row] = await getDb()
    .update(adminUsers)
    .set({
      passwordHash,
      ...(options?.clearMustReset ? { mustResetPassword: false } : {}),
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, userId))
    .returning();

  if (!row) {
    throw new Error("User not found.");
  }

  return mapUser(row);
}

export async function clearMustResetPassword(userId: string) {
  await getDb()
    .update(adminUsers)
    .set({ mustResetPassword: false, updatedAt: new Date() })
    .where(eq(adminUsers.id, userId));
}

export async function createPasswordResetToken(userId: string) {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await getDb().insert(adminPasswordTokens).values({
    userId,
    tokenHash: hashToken(token),
    type: "forgot_password",
    expiresAt,
  });

  return token;
}

export async function validatePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const [row] = await getDb()
    .select()
    .from(adminPasswordTokens)
    .where(eq(adminPasswordTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return null;
  }

  return row.userId;
}

export async function markPasswordResetTokenUsed(token: string) {
  const tokenHash = hashToken(token);
  await getDb()
    .update(adminPasswordTokens)
    .set({ usedAt: new Date() })
    .where(eq(adminPasswordTokens.tokenHash, tokenHash));
}

export async function getActiveAdminUserCount() {
  const totalResult = await getDb().select({ total: count() }).from(adminUsers);
  return Number(totalResult[0]?.total ?? 0);
}

export async function hasAnyAdminUsers() {
  return (await getActiveAdminUserCount()) > 0;
}
