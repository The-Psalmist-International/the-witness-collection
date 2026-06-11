import { redirect } from "next/navigation";
import { AccountSettingsShell } from "@/app/components/account/AccountSettingsShell";
import { ProfileSettingsForm } from "@/app/components/account/ProfileSettingsForm";
import { verifyCustomerSession } from "@/app/lib/customer/auth";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuthenticated) {
    redirect("/account/login?redirect=/account/settings/profile");
  }

  return (
    <AccountSettingsShell
      title="Personal information"
      description="Manage your name, email, and contact details."
    >
      <ProfileSettingsForm customer={session} />
    </AccountSettingsShell>
  );
}
