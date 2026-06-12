"use client";

import type { Preorder } from "@/app/lib/db/schema";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";
import { formatOrderReference } from "@/app/lib/payments/reference";

type OrderInvoiceViewProps = {
  preorder: Preorder;
  showActions?: boolean;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(date);
}

export function OrderInvoiceView({
  preorder,
  showActions = false,
}: OrderInvoiceViewProps) {
  const orderRef = formatOrderReference(preorder.orderReference, preorder.id);
  const receiptBase = `/receipt/${preorder.id}?ref=${preorder.orderReference}`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      {/* Header banner */}
      <div
        className="relative px-6 py-7 md:px-8"
        style={{
          background: "#3b0764",
          backgroundImage: "url('/holy-communion-concept-with-bible.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(30,0,60,0.82)" }}
        />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/THC LOGOa copy.jpg"
              alt="The Witness Collection"
              className="w-10 h-10 rounded-xl object-cover"
              style={{ border: "2px solid rgba(255,255,255,0.25)" }}
            />
            <span
              className="text-white text-xs font-semibold uppercase tracking-widest"
              style={{ opacity: 0.9 }}
            >
              The Witness Collection
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Invoice
            </p>
            <p className="mt-1 text-2xl font-bold text-white tracking-tight">
              {preorder.invoiceNumber ?? "Pending issuance"}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8">
        {/* Meta row */}
        <div className="flex flex-wrap gap-6 pb-6 border-b border-neutral-100 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              Order Reference
            </p>
            <p className="text-sm font-medium text-neutral-800">{orderRef}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              Date Issued
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {preorder.invoiceIssuedAt
                ? formatDate(preorder.invoiceIssuedAt)
                : "After payment confirmation"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              Payment Status
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              {getPaymentStatusLabel(preorder.paymentStatus)}
            </span>
          </div>
        </div>

        {/* Bill to / Fulfillment */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
              Bill to
            </p>
            <p className="font-semibold text-black">{preorder.customerName}</p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {preorder.customerEmail}
            </p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {preorder.customerPhone}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
              Fulfillment
            </p>
            <p className="font-semibold capitalize text-black">
              {preorder.fulfillmentType}
            </p>
            {preorder.fulfillmentType === "delivery" &&
            preorder.customerLocation ? (
              <p className="mt-0.5 text-sm text-neutral-500">
                {preorder.customerLocation}
              </p>
            ) : null}
          </div>
        </div>

        {/* Items table */}
        <div className="rounded-xl border border-neutral-100 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Item
                </th>
                <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Size
                </th>
                <th className="py-3 px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Qty
                </th>
                <th className="py-3 px-4 text-right text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {preorder.items.map((item) => (
                <tr
                  key={`${preorder.id}-${item.productId}-${item.selectedSize}`}
                >
                  <td className="py-3 px-4 font-medium text-black">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">
                    {item.selectedSize}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">
                    {item.quantity ?? 1}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-black">
                    {item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 border-t border-neutral-100 pt-4 text-sm">
          {preorder.subtotalLabel ? (
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>{preorder.subtotalLabel}</span>
            </div>
          ) : null}
          {preorder.discountLabel ? (
            <div className="flex justify-between text-purple-700 font-medium">
              <span>Discount</span>
              <span>{preorder.discountLabel}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-bold text-black border-t border-neutral-100 pt-3 mt-2">
            <span>Total</span>
            <span className="text-purple-900">{preorder.totalLabel}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && preorder.paymentStatus === "confirmed" ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`${receiptBase}&download=true`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-purple-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-900 transition-colors"
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print / Download PDF
            </a>
            <a
              href={receiptBase}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-neutral-50 transition-colors"
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View full invoice
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
