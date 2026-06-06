import { redirect } from "next/navigation";
import { AdminProductsPanel } from "@/app/admin/AdminProductsPanel";
import { AdminShell } from "@/app/admin/AdminShell";
import { parsePageParam } from "@/app/lib/admin/pagination";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { requireAdminPageAccess } from "@/app/lib/admin/guards";
import { listProductsPaginated } from "@/app/lib/products/data";
import type { DbProduct } from "@/app/lib/products/types";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin");
  }

  const guardedSession = await requireAdminPageAccess("products");
  const params = await searchParams;
  const page = parsePageParam(params.page);

  let databaseError = "";
  let result: {
    items: DbProduct[];
    totalItems: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  } = {
    items: [],
    totalItems: 0,
    pageSize: 10,
    currentPage: page,
    totalPages: 1,
  };

  try {
    result = await listProductsPaginated(page);
  } catch (error) {
    databaseError =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "DATABASE_URL is not configured, so products cannot be loaded yet."
        : "Products could not be loaded.";
  }

  return (
    <AdminShell email={guardedSession.email} role={guardedSession.role}>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-black md:text-4xl">
            Products
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage the catalog shown on the shop and home pages.
          </p>
        </div>
      </div>

      {databaseError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {databaseError}
        </div>
      ) : (
        <AdminProductsPanel
          products={result.items}
          pagination={{
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
            pageSize: result.pageSize,
          }}
        />
      )}
    </AdminShell>
  );
}
