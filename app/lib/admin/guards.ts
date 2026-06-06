import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import {
  getDefaultAdminPath,
  hasPermission,
  type AdminPermission,
} from "@/app/lib/admin/roles";

export async function requireAdminPageAccess(permission: AdminPermission) {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin");
  }

  if (session.mustResetPassword) {
    redirect("/admin/reset-password");
  }

  if (!hasPermission(session.role, permission)) {
    redirect(getDefaultAdminPath(session.role));
  }

  return session;
}

export async function requireAuthenticatedAdminPage() {
  const session = await verifyAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin");
  }

  return session;
}
