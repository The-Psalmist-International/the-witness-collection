import { redirect } from "next/navigation";
import { AccountSettingsShell } from "@/app/components/account/AccountSettingsShell";
import { BillingSettingsForm } from "@/app/components/account/BillingSettingsForm";
import { verifyCustomerSession } from "@/app/lib/customer/auth";

export const dynamic = "force-dynamic";

export default async function BillingSettingsPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuthenticated) {
    redirect("/account/login?redirect=/account/settings/billing");
  }

  return (
    <AccountSettingsShell
      title="Billing address"
      description="Save a default billing address for faster checkout."
    >
      <BillingSettingsForm customer={session} />
    </AccountSettingsShell>
  );
}
