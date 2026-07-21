import { notFound } from "next/navigation";
import {
  getPreorderByBachsCheckoutId,
  getPreorderByOrderReference,
} from "@/app/lib/preorders/data";
import { PublicReceiptView } from "@/app/components/PublicReceiptView";
import { BachsPaymentPending } from "@/app/components/BachsPaymentPending";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ checkout_id?: string; ref?: string }>;
};

export default async function BachsReceiptPage({
  searchParams,
}: Props) {
  const { checkout_id, ref } = await searchParams;

  if (!checkout_id && !ref) {
    notFound();
  }

  const order = checkout_id
    ? await getPreorderByBachsCheckoutId(checkout_id)
    : ref
      ? await getPreorderByOrderReference(ref)
      : null;

  if (!order) {
    notFound();
  }

  if (order.paymentStatus !== "confirmed") {
    return <BachsPaymentPending />;
  }

  return (
    <PublicReceiptView preorder={order} />
  );
}
