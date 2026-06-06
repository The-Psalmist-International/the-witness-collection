import { redirect } from "next/navigation";
import { AdminShell } from "@/app/admin/AdminShell";
import { AdminUsersPanel } from "@/app/admin/AdminUsersPanel";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { requireAdminPageAccess } from "@/app/lib/admin/guards";
import { parsePageParam } from "@/app/lib/admin/pagination";
import {
  listAdminUsersPaginated,
  type AdminUserRecord,
} from "@/app/lib/admin/users/data";

export const dynamic = "force-dynamic";

type UsersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin");
  }

  const guardedSession = await requireAdminPageAccess("users");
  const params = await searchParams;
  const page = parsePageParam(params.page);

  let databaseError = "";
  let result: {
    items: AdminUserRecord[];
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
    result = await listAdminUsersPaginated(page);
  } catch (error) {
    databaseError =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "DATABASE_URL is not configured, so users cannot be loaded yet."
        : "Users could not be loaded.";
  }

  return (
    <AdminShell email={guardedSession.email} role={guardedSession.role}>
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-black md:text-4xl">
            Users
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Invite team members, assign roles, and manage account access.
          </p>
        </div>
      </div>

      {databaseError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {databaseError}
        </div>
      ) : (
        <AdminUsersPanel
          users={result.items}
          currentUserId={guardedSession.userId}
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
