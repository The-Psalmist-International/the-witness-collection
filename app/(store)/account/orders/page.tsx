import { redirect } from "next/navigation";
import { AccountSettingsShell } from "@/app/components/account/AccountSettingsShell";
import { CustomerOrdersList } from "@/app/components/account/CustomerOrdersList";
import { verifyCustomerSession } from "@/app/lib/customer/auth";
import { listCustomerOrders } from "@/app/lib/customer/users/data";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuthenticated) {
    redirect("/account/login?redirect=/account/orders");
  }

  const orders = await listCustomerOrders(session.userId);

  return (
    <AccountSettingsShell
      title="My orders"
      description="Track the status of your pre-orders from confirmation to delivery or pickup."
    >
      <CustomerOrdersList orders={orders} />
    </AccountSettingsShell>
  );
}
