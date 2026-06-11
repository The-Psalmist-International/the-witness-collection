import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminPaymentsTable } from "@/app/admin/AdminPaymentsTable";
import { AdminSearchBar } from "@/app/admin/AdminSearchBar";
import { AdminShell } from "@/app/admin/AdminShell";
import type { Preorder } from "@/app/lib/db/schema";
import { parsePageParam } from "@/app/lib/admin/pagination";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { requireAdminPageAccess } from "@/app/lib/admin/guards";
import { listPaymentsPaginated } from "@/app/lib/preorders/data";

export const dynamic = "force-dynamic";

type PaymentsPageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function AdminPaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin");
  }

  const guardedSession = await requireAdminPageAccess("payments");
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const query = params.q?.trim() ?? "";

  let databaseError = "";
  let result: {
    items: Preorder[];
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
    result = await listPaymentsPaginated(page, undefined, query || undefined);
  } catch (error) {
    databaseError =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "DATABASE_URL is not configured, so payments cannot be loaded yet."
        : "Payments could not be loaded.";
  }

  return (
    <AdminShell email={guardedSession.email} role={guardedSession.role}>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-black md:text-4xl">
            Payments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Review payment proofs, confirm payments, and issue invoices.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Suspense fallback={null}>
          <AdminSearchBar placeholder="Search by reference, name, email, or phone…" />
        </Suspense>
      </div>

      {databaseError ? (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {databaseError}
        </div>
      ) : (
        <div className="mt-6">
          <AdminPaymentsTable
            preorders={result.items}
            searchQuery={query}
            pagination={{
              currentPage: result.currentPage,
              totalPages: result.totalPages,
              totalItems: result.totalItems,
              pageSize: result.pageSize,
            }}
          />
        </div>
      )}
    </AdminShell>
  );
}
