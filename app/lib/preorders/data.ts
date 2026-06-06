import { count, desc, eq, inArray } from "drizzle-orm";
import { ADMIN_PAGE_SIZE } from "@/app/lib/admin/pagination";
import { getDb } from "@/app/lib/db";
import { preorders, products, type Preorder } from "@/app/lib/db/schema";
import type { PreorderStatus } from "@/app/lib/preorders/constants";
import type { CartItem } from "@/app/lib/preorders/types";

async function enrichPreorders(preorderRows: Preorder[]): Promise<Preorder[]> {
  const missingImageIds = [
    ...new Set(
      preorderRows.flatMap((preorder) =>
        preorder.items
          .filter((item) => !item.image)
          .map((item) => item.productId)
          .filter(Boolean)
      )
    ),
  ];

  const imageByProductId = new Map<string, string>();

  if (missingImageIds.length > 0) {
    const productRows = await getDb()
      .select({ id: products.id, image: products.image })
      .from(products)
      .where(inArray(products.id, missingImageIds));

    for (const row of productRows) {
      imageByProductId.set(row.id, row.image);
    }
  }

  return preorderRows.map((preorder) => ({
    ...preorder,
    items: preorder.items.map((item) => ({
      ...item,
      image: item.image || imageByProductId.get(item.productId) || "",
    })),
  }));
}

export type NewPreorderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: "pickup" | "delivery";
  customerLocation?: string;
  customerNotes?: string;
  items: CartItem[];
  totalLabel: string;
};

export async function createPreorderRecord(input: NewPreorderInput) {
  const [record] = await getDb()
    .insert(preorders)
    .values({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      fulfillmentType: input.fulfillmentType,
      customerLocation: input.customerLocation || null,
      customerNotes: input.customerNotes || null,
      items: input.items,
      totalLabel: input.totalLabel,
    })
    .returning({ id: preorders.id });

  return record;
}

export async function listPreorders(): Promise<Preorder[]> {
  return getDb().select().from(preorders).orderBy(desc(preorders.createdAt));
}

export async function listPreordersPaginated(
  page: number,
  pageSize = ADMIN_PAGE_SIZE
) {
  const totalResult = await getDb().select({ total: count() }).from(preorders);
  const totalItems = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = await getDb()
    .select()
    .from(preorders)
    .orderBy(desc(preorders.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items = await enrichPreorders(rows);

  return {
    items,
    totalItems,
    pageSize,
    currentPage,
    totalPages,
  };
}

export async function updatePreorderStatus(
  preorderId: string,
  status: PreorderStatus
) {
  await getDb()
    .update(preorders)
    .set({ status, updatedAt: new Date() })
    .where(eq(preorders.id, preorderId));
}
