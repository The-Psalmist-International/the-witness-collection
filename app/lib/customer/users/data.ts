import { desc, eq } from "drizzle-orm";
import { getDb } from "@/app/lib/db";
import { customers, preorders, type Customer } from "@/app/lib/db/schema";
import { hashPassword, verifyPassword } from "@/app/lib/admin/password";

export type CustomerRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  billingAddress: string | null;
  status: "active" | "suspended";
};

function mapCustomer(row: Customer): CustomerRecord {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    billingAddress: row.billingAddress,
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

export async function getCustomerWithPasswordById(customerId: string) {
  const [row] = await getDb()
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  return row ?? null;
}

export async function createCustomer(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  billingAddress?: string | null;
}) {
  const passwordHash = hashPassword(input.password);
  const [row] = await getDb()
    .insert(customers)
    .values({
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      billingAddress: input.billingAddress?.trim() || null,
      passwordHash,
    })
    .returning();

  return row ? mapCustomer(row) : null;
}

export async function updateCustomerProfile(
  customerId: string,
  input: {
    firstName: string;
    lastName: string;
    phone: string;
  }
) {
  const [row] = await getDb()
    .update(customers)
    .set({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId))
    .returning();

  return row ? mapCustomer(row) : null;
}

export async function updateCustomerBillingAddress(
  customerId: string,
  billingAddress: string
) {
  const [row] = await getDb()
    .update(customers)
    .set({
      billingAddress: billingAddress.trim(),
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId))
    .returning();

  return row ? mapCustomer(row) : null;
}

export async function updateCustomerPassword(
  customerId: string,
  password: string
) {
  const passwordHash = hashPassword(password);

  await getDb()
    .update(customers)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId));
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

export async function verifyCustomerPassword(customerId: string, password: string) {
  const row = await getCustomerWithPasswordById(customerId);

  if (!row) {
    return false;
  }

  return verifyPassword(password, row.passwordHash);
}

export async function listCustomerOrders(customerId: string) {
  return getDb()
    .select({
      id: preorders.id,
      orderReference: preorders.orderReference,
      status: preorders.status,
      paymentStatus: preorders.paymentStatus,
      invoiceNumber: preorders.invoiceNumber,
      fulfillmentType: preorders.fulfillmentType,
      totalLabel: preorders.totalLabel,
      discountLabel: preorders.discountLabel,
      customerLocation: preorders.customerLocation,
      createdAt: preorders.createdAt,
      items: preorders.items,
    })
    .from(preorders)
    .where(eq(preorders.customerId, customerId))
    .orderBy(desc(preorders.createdAt));
}
