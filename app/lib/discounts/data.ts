import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/app/lib/db";
import { discounts, type Discount } from "@/app/lib/db/schema";
import type {
  DiscountRecord,
  DiscountScope,
  DiscountType,
} from "@/app/lib/discounts/types";

function mapDiscount(row: Discount): DiscountRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.type as DiscountType,
    value: row.value,
    scope: row.scope as DiscountScope,
    code: row.code,
    productIds: row.productIds ?? [],
    isActive: row.isActive,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    maxUses: row.maxUses,
    usedCount: row.usedCount,
  };
}

export async function listDiscounts() {
  const rows = await getDb()
    .select()
    .from(discounts)
    .orderBy(desc(discounts.createdAt));

  return rows.map(mapDiscount);
}

export async function listActiveDiscounts() {
  const rows = await getDb().select().from(discounts).where(eq(discounts.isActive, true));
  return rows.map(mapDiscount);
}

export async function getDiscountById(discountId: string) {
  const [row] = await getDb()
    .select()
    .from(discounts)
    .where(eq(discounts.id, discountId))
    .limit(1);

  return row ? mapDiscount(row) : null;
}

export async function createDiscount(input: {
  name: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  code?: string;
  productIds: string[];
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  maxUses?: number | null;
  createdBy?: string;
}) {
  const [row] = await getDb()
    .insert(discounts)
    .values({
      name: input.name,
      type: input.type,
      value: input.value,
      scope: input.scope,
      code: input.code?.trim().toUpperCase() || null,
      productIds: input.productIds,
      isActive: input.isActive,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      maxUses: input.maxUses ?? null,
      createdBy: input.createdBy ?? null,
    })
    .returning();

  return row ? mapDiscount(row) : null;
}

export async function setDiscountActive(discountId: string, isActive: boolean) {
  await getDb()
    .update(discounts)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(discounts.id, discountId));
}

export async function incrementDiscountUsage(discountId: string) {
  await getDb()
    .update(discounts)
    .set({
      usedCount: sql`${discounts.usedCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(discounts.id, discountId), eq(discounts.isActive, true)));
}
