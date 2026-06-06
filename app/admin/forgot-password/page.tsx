import { AdminForgotPasswordForm } from "@/app/admin/AdminForgotPasswordForm";
import { AdminLoginPage } from "@/app/admin/AdminLoginPage";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { getDefaultAdminPath } from "@/app/lib/admin/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminForgotPasswordPage() {
  const session = await verifyAdminSession();

  if (session.isAuthenticated) {
    if (session.mustResetPassword) {
      redirect("/admin/reset-password");
    }

    redirect(getDefaultAdminPath(session.role));
  }

  return (
    <AdminLoginPage isConfigured={session.isConfigured} showForm={false}>
      <AdminForgotPasswordForm />
    </AdminLoginPage>
  );
}
