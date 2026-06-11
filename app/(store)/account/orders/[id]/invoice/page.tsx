import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSettingsShell } from "@/app/components/account/AccountSettingsShell";
import { OrderInvoiceView } from "@/app/components/OrderInvoiceView";
import { verifyCustomerSession } from "@/app/lib/customer/auth";
import { getCustomerOrderById } from "@/app/lib/preorders/data";

export const dynamic = "force-dynamic";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerInvoicePage({ params }: InvoicePageProps) {
  const session = await verifyCustomerSession();

  if (!session.isAuthenticated) {
    redirect("/account/login?redirect=/account/orders");
  }

  const { id } = await params;
  const order = await getCustomerOrderById(session.userId, id);

  if (!order) {
    redirect("/account/orders");
  }

  return (
    <AccountSettingsShell
      title="Invoice"
      description={
        order.paymentStatus === "confirmed"
          ? "Your payment was confirmed and this invoice is ready to view or print."
          : "Your invoice will be available here once payment is confirmed."
      }
    >
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="text-sm font-medium text-purple-950 hover:underline"
        >
          Back to orders
        </Link>
      </div>
      <OrderInvoiceView preorder={order} showActions />
    </AccountSettingsShell>
  );
}
