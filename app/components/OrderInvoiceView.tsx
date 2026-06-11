import type { Preorder } from "@/app/lib/db/schema";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";

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
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Invoice
          </p>
          <h1 className="mt-2 text-2xl font-medium text-black">
            {preorder.invoiceNumber ?? "Pending issuance"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Order reference: {preorder.orderReference}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Issued
          </p>
          <p className="mt-2 text-sm text-black">
            {preorder.invoiceIssuedAt
              ? formatDate(preorder.invoiceIssuedAt)
              : "After payment confirmation"}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-950">
            {getPaymentStatusLabel(preorder.paymentStatus)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-100 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Bill to
          </p>
          <p className="mt-2 font-medium text-black">{preorder.customerName}</p>
          <p className="mt-1 text-sm text-neutral-600">
            {preorder.customerEmail}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {preorder.customerPhone}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Fulfillment
          </p>
          <p className="mt-2 font-medium capitalize text-black">
            {preorder.fulfillmentType}
          </p>
          {preorder.fulfillmentType === "delivery" &&
          preorder.customerLocation ? (
            <p className="mt-1 text-sm text-neutral-600">
              {preorder.customerLocation}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-500">
            <tr>
              <th className="py-3 font-medium">Item</th>
              <th className="py-3 font-medium">Size</th>
              <th className="py-3 font-medium">Qty</th>
              <th className="py-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {preorder.items.map((item) => (
              <tr key={`${preorder.id}-${item.productId}-${item.selectedSize}`}>
                <td className="py-3 font-medium text-black">{item.name}</td>
                <td className="py-3 text-neutral-600">{item.selectedSize}</td>
                <td className="py-3 text-neutral-600">{item.quantity ?? 1}</td>
                <td className="py-3 text-right text-black">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-2 border-t border-neutral-100 pt-4 text-sm">
        {preorder.subtotalLabel ? (
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span>{preorder.subtotalLabel}</span>
          </div>
        ) : null}
        {preorder.discountLabel ? (
          <div className="flex justify-between text-purple-950">
            <span>Discount</span>
            <span>{preorder.discountLabel}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-base font-medium text-black">
          <span>Total</span>
          <span>{preorder.totalLabel}</span>
        </div>
      </div>

      {showActions && preorder.paymentStatus === "confirmed" ? (
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white"
        >
          Print invoice
        </button>
      ) : null}
    </div>
  );
}
