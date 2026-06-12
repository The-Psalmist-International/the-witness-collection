import { and, count, desc, eq, gte, ilike, inArray, or } from "drizzle-orm";
import { ADMIN_PAGE_SIZE } from "@/app/lib/admin/pagination";
import { getDb } from "@/app/lib/db";
import { preorders, products, type Preorder } from "@/app/lib/db/schema";
import { generateInvoiceNumber, generateOrderReference } from "@/app/lib/payments/reference";
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
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: "pickup" | "delivery";
  customerLocation?: string;
  customerNotes?: string;
  items: CartItem[];
  subtotalLabel: string;
  discountLabel?: string;
  discountCode?: string;
  discountId?: string;
  totalLabel: string;
  paymentProofUrl: string;
};

export async function createPreorderRecord(input: NewPreorderInput) {
  const now = new Date();
  const [record] = await getDb()
    .insert(preorders)
    .values({
      customerId: input.customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      fulfillmentType: input.fulfillmentType,
      customerLocation: input.customerLocation || null,
      customerNotes: input.customerNotes || null,
      items: input.items,
      subtotalLabel: input.subtotalLabel,
      discountLabel: input.discountLabel || null,
      discountCode: input.discountCode || null,
      discountId: input.discountId || null,
      totalLabel: input.totalLabel,
      orderReference: generateOrderReference(),
      paymentStatus: "pending_confirmation",
      paymentProofUrl: input.paymentProofUrl,
      paymentProofUploadedAt: now,
    })
    .returning({
      id: preorders.id,
      orderReference: preorders.orderReference,
      paymentStatus: preorders.paymentStatus,
      createdAt: preorders.createdAt,
    });

  return record;
}

export async function listPreorders(): Promise<Preorder[]> {
  return getDb().select().from(preorders).orderBy(desc(preorders.createdAt));
}

function buildPreorderSearchFilter(query?: string) {
  const trimmed = query?.trim();

  if (!trimmed) {
    return undefined;
  }

  const pattern = `%${trimmed}%`;

  return or(
    ilike(preorders.customerName, pattern),
    ilike(preorders.customerEmail, pattern),
    ilike(preorders.orderReference, pattern),
    ilike(preorders.customerPhone, pattern),
    ilike(preorders.invoiceNumber, pattern)
  );
}

export async function getPreorderById(preorderId: string) {
  const [row] = await getDb()
    .select()
    .from(preorders)
    .where(eq(preorders.id, preorderId))
    .limit(1);

  if (!row) {
    return null;
  }

  const [enriched] = await enrichPreorders([row]);
  return enriched ?? null;
}

export async function getCustomerOrderById(
  customerId: string,
  preorderId: string
) {
  const [row] = await getDb()
    .select()
    .from(preorders)
    .where(eq(preorders.id, preorderId))
    .limit(1);

  if (!row || row.customerId !== customerId) {
    return null;
  }

  const [enriched] = await enrichPreorders([row]);
  return enriched ?? null;
}

export async function getDashboardOrderMetrics() {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [statusCounts, recentOrders, completedRevenueOrders] = await Promise.all([
    getDb()
      .select({
        status: preorders.status,
        total: count(),
      })
      .from(preorders)
      .groupBy(preorders.status),
    getDb()
      .select({
        status: preorders.status,
        totalLabel: preorders.totalLabel,
        createdAt: preorders.createdAt,
      })
      .from(preorders)
      .where(gte(preorders.createdAt, fourteenDaysAgo))
      .orderBy(desc(preorders.createdAt)),
    getDb()
      .select({ totalLabel: preorders.totalLabel })
      .from(preorders)
      .where(eq(preorders.status, "completed")),
  ]);

  return { statusCounts, recentOrders, completedRevenueOrders };
}

export async function listPreordersPaginated(
  page: number,
  pageSize = ADMIN_PAGE_SIZE,
  query?: string
) {
  const searchFilter = buildPreorderSearchFilter(query);
  const totalQuery = getDb().select({ total: count() }).from(preorders);

  const totalResult = searchFilter
    ? await totalQuery.where(searchFilter)
    : await totalQuery;
  const totalItems = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rowsQuery = getDb()
    .select()
    .from(preorders)
    .orderBy(desc(preorders.createdAt))
    .limit(pageSize)
    .offset(offset);

  const rows = searchFilter
    ? await rowsQuery.where(searchFilter)
    : await rowsQuery;

  const items = await enrichPreorders(rows);

  return {
    items,
    totalItems,
    pageSize,
    currentPage,
    totalPages,
  };
}

export async function listPaymentsPaginated(
  page: number,
  pageSize = ADMIN_PAGE_SIZE,
  query?: string
) {
  const searchFilter = buildPreorderSearchFilter(query);
  const paymentFilter = eq(preorders.paymentStatus, "pending_confirmation");
  const whereClause = searchFilter
    ? and(paymentFilter, searchFilter)
    : paymentFilter;

  const totalResult = await getDb()
    .select({ total: count() })
    .from(preorders)
    .where(whereClause);
  const totalItems = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = await getDb()
    .select()
    .from(preorders)
    .where(whereClause)
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

export async function confirmPreorderPayment(preorderId: string) {
  const now = new Date();
  const invoiceNumber = generateInvoiceNumber();

  const [row] = await getDb()
    .update(preorders)
    .set({
      paymentStatus: "confirmed",
      paymentConfirmedAt: now,
      invoiceNumber,
      invoiceIssuedAt: now,
      updatedAt: now,
    })
    .where(eq(preorders.id, preorderId))
    .returning();

  if (!row) {
    return null;
  }

  const [enriched] = await enrichPreorders([row]);
  return enriched ?? null;
}

export async function rejectPreorderPayment(preorderId: string) {
  const now = new Date();

  const [row] = await getDb()
    .update(preorders)
    .set({
      paymentStatus: "rejected",
      updatedAt: now,
    })
    .where(eq(preorders.id, preorderId))
    .returning();

  if (!row) {
    return null;
  }

  const [enriched] = await enrichPreorders([row]);
  return enriched ?? null;
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
