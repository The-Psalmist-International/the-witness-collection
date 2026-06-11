import { redirect } from "next/navigation";
import { AccountSettingsShell } from "@/app/components/account/AccountSettingsShell";
import { SecuritySettingsForm } from "@/app/components/account/SecuritySettingsForm";
import { verifyCustomerSession } from "@/app/lib/customer/auth";

export const dynamic = "force-dynamic";

export default async function SecuritySettingsPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuthenticated) {
    redirect("/account/login?redirect=/account/settings/security");
  }

  return (
    <AccountSettingsShell
      title="Privacy & security"
      description="Manage your password and account access."
    >
      <SecuritySettingsForm />
    </AccountSettingsShell>
  );
}
