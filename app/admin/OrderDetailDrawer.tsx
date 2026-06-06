"use client";

import Image from "next/image";
import { useTransition } from "react";
import { changePreorderStatus } from "@/app/admin/actions";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import type { Preorder } from "@/app/lib/db/schema";
import { PREORDER_STATUSES } from "@/app/lib/preorders/constants";

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

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await changePreorderStatus(
        preorder.id,
        status as (typeof PREORDER_STATUSES)[number]
      );
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
            Total
          </h3>
          <p className="mt-2 text-lg font-medium text-black">
            {preorder.totalLabel}
          </p>
        </section>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Status
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PREORDER_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={pending}
                onClick={() => handleStatusChange(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  preorder.status === status
                    ? "bg-purple-950 text-white"
                    : "border border-neutral-200 text-black hover:border-purple-950"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AdminDrawer>
  );
}
