import { AdminDiscountsPanel } from "@/app/admin/AdminDiscountsPanel";
import { AdminShell } from "@/app/admin/AdminShell";
import { listDiscounts } from "@/app/lib/discounts/data";
import { requireAdminPageAccess } from "@/app/lib/admin/guards";
import { listProducts } from "@/app/lib/products/data";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const session = await requireAdminPageAccess("discounts");

  let discounts: Awaited<ReturnType<typeof listDiscounts>> = [];
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let databaseError = "";

  try {
    [discounts, products] = await Promise.all([listDiscounts(), listProducts()]);
  } catch (error) {
    databaseError =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "DATABASE_URL is not configured, so discounts cannot be loaded yet."
        : "Discount data could not be loaded.";
  }

  return (
    <AdminShell email={session.email} role={session.role}>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-black md:text-4xl">
            Discounts
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Create general site-wide discounts, product-specific offers, or secret
            codes to share with customers at checkout.
          </p>
        </div>
      </div>

      {databaseError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {databaseError}
        </div>
      ) : (
        <AdminDiscountsPanel discounts={discounts} products={products} />
      )}
    </AdminShell>
  );
}
