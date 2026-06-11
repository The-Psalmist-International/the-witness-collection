import { eq } from "drizzle-orm";
import { getDb } from "@/app/lib/db";
import { customers, type Customer } from "@/app/lib/db/schema";
import { hashPassword, verifyPassword } from "@/app/lib/admin/password";

export type CustomerRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: "active" | "suspended";
};

function mapCustomer(row: Customer): CustomerRecord {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    status: row.status as "active" | "suspended",
  };
}

export async function getCustomerByEmail(email: string) {
  const [row] = await getDb()
    .select()
    .from(customers)
    .where(eq(customers.email, email.trim().toLowerCase()))
    .limit(1);

  return row ? mapCustomer(row) : null;
}

export async function getCustomerById(customerId: string) {
  const [row] = await getDb()
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  return row ? mapCustomer(row) : null;
}

export async function getCustomerWithPasswordByEmail(email: string) {
  const [row] = await getDb()
    .select()
    .from(customers)
    .where(eq(customers.email, email.trim().toLowerCase()))
    .limit(1);

  return row ?? null;
}

export async function createCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}) {
  const passwordHash = hashPassword(input.password);
  const [row] = await getDb()
    .insert(customers)
    .values({
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      passwordHash,
    })
    .returning();

  return row ? mapCustomer(row) : null;
}

export async function authenticateCustomerLogin(email: string, password: string) {
  const row = await getCustomerWithPasswordByEmail(email);

  if (!row) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (row.status !== "active") {
    return { ok: false as const, reason: "suspended" as const };
  }

  if (!verifyPassword(password, row.passwordHash)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  return { ok: true as const, user: mapCustomer(row) };
}
