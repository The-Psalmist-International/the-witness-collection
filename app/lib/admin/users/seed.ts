import { count } from "drizzle-orm";
import { hashPassword } from "@/app/lib/admin/password";
import { getDb } from "@/app/lib/db";
import { adminUsers } from "@/app/lib/db/schema";

export async function bootstrapAdminUser() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const db = getDb();
    const totalResult = await db.select({ total: count() }).from(adminUsers);
    const totalUsers = Number(totalResult[0]?.total ?? 0);

    if (totalUsers > 0) {
      return;
    }

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
    const password = process.env.ADMIN_PASSWORD ?? "";
    const passwordSha256 = process.env.ADMIN_PASSWORD_SHA256 ?? "";

    if (!email || (!password && !passwordSha256)) {
      return;
    }

    let passwordHash = "";

    if (password) {
      passwordHash = hashPassword(password);
    } else if (passwordSha256) {
      passwordHash = `legacy-sha256:${passwordSha256}`;
    }

    await db.insert(adminUsers).values({
      email,
      passwordHash,
      role: "admin",
      status: "active",
      mustResetPassword: false,
    });
  } catch (error) {
    console.error("[bootstrapAdminUser]", error);
    throw new Error(
      "Database is unavailable. Check DATABASE_URL and run npm run db:push."
    );
  }
}
