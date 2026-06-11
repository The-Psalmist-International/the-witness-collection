"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { changePreorderStatus } from "@/app/admin/actions";
import { PaymentProofPreview } from "@/app/admin/PaymentProofPreview";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import { OrderInvoiceView } from "@/app/components/OrderInvoiceView";
import type { Preorder } from "@/app/lib/db/schema";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";
import { formatOrderReference } from "@/app/lib/payments/reference";
import {
  getStatusesForFulfillment,
  getStatusLabel,
  type FulfillmentType,
  type PreorderStatus,
} from "@/app/lib/preorders/constants";

type OrderDetailDrawerProps = {
  preorder: Preorder | null;
  onClose: () => void;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-neutral-100 py-3 text-sm last:border-b-0">
      <dt className="font-medium text-neutral-500">{label}</dt>
      <dd className="text-black">{value}</dd>
    </div>
  );
}

export function OrderDetailDrawer({ preorder, onClose }: OrderDetailDrawerProps) {
  const [pending, startTransition] = useTransition();

  if (!preorder) {
    return null;
  }

  const fulfillmentType = (preorder.fulfillmentType ?? "delivery") as FulfillmentType;
  const statusOptions = getStatusesForFulfillment(fulfillmentType);

  const handleStatusChange = (status: PreorderStatus) => {
    startTransition(async () => {
      await changePreorderStatus(preorder.id, status);
    });
  };

  return (
    <AdminDrawer
      isOpen={Boolean(preorder)}
      onClose={onClose}
      eyebrow="Order details"
      title={preorder.customerName}
      subtitle={formatDate(preorder.createdAt)}
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Customer
          </h3>
          <dl className="mt-2 rounded-md border border-neutral-200 px-4">
            <DetailRow label="Name" value={preorder.customerName} />
            <DetailRow label="Email" value={preorder.customerEmail} />
            <DetailRow label="Phone" value={preorder.customerPhone} />
          </dl>
        </section>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Fulfillment
          </h3>
          <dl className="mt-2 rounded-md border border-neutral-200 px-4">
            <DetailRow
              label="Type"
              value={(preorder.fulfillmentType ?? "delivery").replace(
                /^\w/,
                (char) => char.toUpperCase()
              )}
            />
            <DetailRow
              label="Address"
              value={
                preorder.fulfillmentType === "pickup"
                  ? "Pickup"
                  : preorder.customerLocation || "—"
              }
            />
          </dl>
        </section>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Items
          </h3>
          <div className="mt-3 overflow-x-auto rounded-md border border-neutral-200">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {preorder.items.map((item) => (
                  <tr key={`${preorder.id}-${item.productId}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                              No image
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-black">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {item.selectedSize}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {item.quantity ?? 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-black">
                      {item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {preorder.customerNotes && (
          <section>
            <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              Notes
            </h3>
            <p className="mt-2 rounded-md border border-neutral-200 px-4 py-3 text-sm leading-6 text-neutral-600">
              {preorder.customerNotes}
            </p>
          </section>
        )}

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Totals
          </h3>
          <dl className="mt-2 rounded-md border border-neutral-200 px-4">
            {preorder.subtotalLabel ? (
              <DetailRow label="Subtotal" value={preorder.subtotalLabel} />
            ) : null}
            {preorder.discountLabel ? (
              <DetailRow label="Discount" value={preorder.discountLabel} />
            ) : null}
            {preorder.discountCode ? (
              <DetailRow label="Code" value={preorder.discountCode} />
            ) : null}
            <DetailRow label="Total" value={preorder.totalLabel} />
          </dl>
        </section>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Payment
          </h3>
          <dl className="mt-2 rounded-md border border-neutral-200 px-4">
            <DetailRow
              label="Reference"
              value={formatOrderReference(preorder.orderReference, preorder.id)}
            />
            <DetailRow
              label="Status"
              value={getPaymentStatusLabel(preorder.paymentStatus)}
            />
            {preorder.invoiceNumber ? (
              <DetailRow label="Invoice" value={preorder.invoiceNumber} />
            ) : null}
          </dl>

          {preorder.paymentProofUrl ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
                Payment proof
              </p>
              <PaymentProofPreview
                url={preorder.paymentProofUrl}
                alt={`Payment proof for ${formatOrderReference(preorder.orderReference, preorder.id)}`}
              />
            </div>
          ) : null}

          {preorder.paymentStatus === "confirmed" ? (
            <div className="mt-6">
              <OrderInvoiceView preorder={preorder} />
              <Link
                href={`/account/orders/${preorder.id}/invoice`}
                className="mt-4 inline-flex text-sm font-medium text-purple-950 hover:underline"
              >
                Open customer invoice page
              </Link>
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Status
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                disabled={pending}
                onClick={() => handleStatusChange(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  preorder.status === status
                    ? "bg-purple-950 text-white"
                    : "border border-neutral-200 text-black hover:border-purple-950"
                }`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AdminDrawer>
  );
}
