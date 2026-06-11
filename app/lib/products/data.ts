import { asc, count, eq, max } from "drizzle-orm";
import type { Product } from "@/app/components/ProductCard";
import { ADMIN_PAGE_SIZE } from "@/app/lib/admin/pagination";
import { getDb } from "@/app/lib/db";
import { products } from "@/app/lib/db/schema";
import {
  toProduct,
  type DbProduct,
  type NewProductInput,
} from "@/app/lib/products/types";

function mapRow(row: typeof products.$inferSelect): DbProduct {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    hoverImage: row.hoverImage,
    tag: row.tag,
    sizes: row.sizes ?? [],
    category: row.category,
    homeSection: row.homeSection,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export async function listProducts() {
  const rows = await getDb()
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder));

  return rows;
}

export async function listActiveProducts(): Promise<Product[]> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.sortOrder));

  return rows.map((row) => toProduct(mapRow(row)));
}

export async function listProductsPaginated(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const totalResult = await getDb().select({ total: count() }).from(products);
  const totalItems = Number(totalResult[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = await getDb()
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder))
    .limit(pageSize)
    .offset(offset);

  return {
    items: rows.map(mapRow),
    totalItems,
    pageSize,
    currentPage,
    totalPages,
  };
}

export async function listHomeProductGroups(): Promise<{
  section1: Product[];
  section2: Product[];
  section3: Product[];
}> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.sortOrder));

  const activeProducts = rows.map((row) => mapRow(row));

  const bySection = (section: number) =>
    activeProducts
      .filter((product) => product.homeSection === section)
      .map(toProduct);

  return {
    section1: bySection(1),
    section2: bySection(2),
    section3: bySection(3),
  };
}

export async function createProduct(input: NewProductInput) {
  const id = crypto.randomUUID().slice(0, 8);

  const [sortResult] = await getDb()
    .select({ maxOrder: max(products.sortOrder) })
    .from(products);
  const sortOrder = (sortResult?.maxOrder ?? 0) + 1;

  const [row] = await getDb()
    .insert(products)
    .values({
      id,
      name: input.name.trim(),
      price: input.price.trim(),
      image: input.image.trim(),
      hoverImage: input.hoverImage?.trim() || null,
      tag: input.tag?.trim() || null,
      sizes: input.sizes ?? [],
      category: input.category?.trim() || null,
      homeSection: input.homeSection ?? null,
      sortOrder,
      isActive: true,
    })
    .returning();

  return mapRow(row);
}

export async function updateProduct(productId: string, input: NewProductInput) {
  const [row] = await getDb()
    .update(products)
    .set({
      name: input.name.trim(),
      price: input.price.trim(),
      image: input.image.trim(),
      hoverImage: input.hoverImage?.trim() || null,
      tag: input.tag?.trim() || null,
      sizes: input.sizes ?? [],
      category: input.category?.trim() || null,
      homeSection: input.homeSection ?? null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  if (!row) {
    throw new Error("Product not found.");
  }

  return mapRow(row);
}

export async function setProductActive(productId: string, isActive: boolean) {
  await getDb()
    .update(products)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(products.id, productId));
}
