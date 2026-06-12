import { notFound } from "next/navigation";
import { getPreorderById } from "@/app/lib/preorders/data";
import { PublicReceiptView } from "@/app/components/PublicReceiptView";

export const dynamic = "force-dynamic";

type ReceiptPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string; download?: string }>;
};

export default async function PublicReceiptPage({
  params,
  searchParams,
}: ReceiptPageProps) {
  const { id } = await params;
  const { ref, download } = await searchParams;

  const order = await getPreorderById(id);

  // Require a matching orderReference as a lightweight security token
  if (!order || order.orderReference !== ref) {
    notFound();
  }

  // Only show confirmed invoices publicly
  if (order.paymentStatus !== "confirmed") {
    notFound();
  }

  return (
    <PublicReceiptView preorder={order} autoDownload={download === "true"} />
  );
}
