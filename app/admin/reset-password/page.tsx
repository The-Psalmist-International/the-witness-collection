import { AdminLoginPage } from "@/app/admin/AdminLoginPage";
import { AdminPasswordResetForm } from "@/app/admin/AdminPasswordResetForm";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { getDefaultAdminPath } from "@/app/lib/admin/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AdminResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await verifyAdminSession();
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  if (session.isAuthenticated && !session.mustResetPassword && !token) {
    redirect(getDefaultAdminPath(session.role));
  }

  if (!session.isAuthenticated && !token) {
    redirect("/admin");
  }

  const isMandatory = session.isAuthenticated && session.mustResetPassword;

  return (
    <AdminLoginPage isConfigured={session.isConfigured} showForm={false}>
      <AdminPasswordResetForm
        mode={isMandatory ? "mandatory" : "token"}
        token={token}
        title={isMandatory ? "Set your new password" : "Reset your password"}
        description={
          isMandatory
            ? "For security, you must choose a new password before accessing the dashboard."
            : "Choose a new password to finish resetting your account."
        }
      />
    </AdminLoginPage>
  );
}
