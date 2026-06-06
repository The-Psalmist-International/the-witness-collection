import { AdminGrowthChart } from "@/app/admin/AdminGrowthChart";
import { AdminLoginPage } from "@/app/admin/AdminLoginPage";
import { AdminShell } from "@/app/admin/AdminShell";
import { AdminStatsCards } from "@/app/admin/AdminStatsCards";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { requireAdminPageAccess } from "@/app/lib/admin/guards";
import {
  buildGrowthSeries,
  getPreorderSummary,
} from "@/app/lib/preorders/analytics";
import { listPreorders } from "@/app/lib/preorders/data";

export const dynamic = "force-dynamic";

type AdminDashboardPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const session = await verifyAdminSession();
  const params = await searchParams;

  if (!session.isAuthenticated) {
    return (
      <AdminLoginPage
        isConfigured={session.isConfigured}
        successMessage={
          params.reset === "success"
            ? "Password updated successfully. Sign in with your new password."
            : undefined
        }
      />
    );
  }

  const guardedSession = await requireAdminPageAccess("dashboard");

  let databaseError = "";
  let summary = {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
  };
  let growthSeries = buildGrowthSeries([]);

  try {
    const preorders = await listPreorders();
    summary = getPreorderSummary(preorders);
    growthSeries = buildGrowthSeries(preorders);
  } catch (error) {
    databaseError =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "DATABASE_URL is not configured, so dashboard data cannot be loaded yet."
        : "Dashboard data could not be loaded.";
  }

  return (
    <AdminShell email={guardedSession.email} role={guardedSession.role}>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-black md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Overview of order activity, revenue, and growth trends.
          </p>
        </div>
      </div>

      {databaseError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {databaseError}
        </div>
      ) : (
        <>
          <AdminStatsCards summary={summary} />
          <AdminGrowthChart series={growthSeries} />
        </>
      )}
    </AdminShell>
  );
}
