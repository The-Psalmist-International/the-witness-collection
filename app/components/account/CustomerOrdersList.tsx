"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getOrderTrackingSteps,
  getStatusLabel,
  type FulfillmentType,
  type PreorderStatus,
} from "@/app/lib/preorders/constants";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";

type CustomerOrder = {
  id: string;
  orderReference: string | null;
  status: string;
  paymentStatus: string;
  invoiceNumber: string | null;
  fulfillmentType: string;
  totalLabel: string;
  discountLabel: string | null;
  customerLocation: string | null;
  createdAt: Date;
  items: {
    name: string;
    quantity?: number;
  }[];
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function OrderStatusTimeline({
  fulfillmentType,
  currentStatus,
}: {
  fulfillmentType: FulfillmentType;
  currentStatus: string;
}) {
  const steps = getOrderTrackingSteps(fulfillmentType);
  const currentIndex = steps.indexOf(currentStatus as PreorderStatus);
  const resolvedIndex =
    currentStatus === "cancelled" ? -1 : Math.max(currentIndex, 0);

  if (currentStatus === "cancelled") {
    return (
      <p className="mt-3 text-sm font-medium text-red-700">
        This order was cancelled.
      </p>
    );
  }

  return (
    <ol className="mt-4 space-y-3">
      {steps.map((step, index) => {
        const isComplete = resolvedIndex > index;
        const isCurrent = resolvedIndex === index;

        return (
          <li key={step} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                isComplete
                  ? "bg-purple-950 text-white"
                  : isCurrent
                    ? "border-2 border-purple-950 text-purple-950"
                    : "border border-neutral-300 text-neutral-400"
              }`}
            >
              {isComplete ? "✓" : index + 1}
            </span>
            <div>
              <p
                className={`text-sm ${
                  isCurrent || isComplete
                    ? "font-medium text-black"
                    : "text-neutral-500"
                }`}
              >
                {getStatusLabel(step)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function CustomerOrdersList({ orders }: { orders: CustomerOrder[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const haystack = [
        order.orderReference,
        order.invoiceNumber,
        order.totalLabel,
        order.status,
        order.paymentStatus,
        ...order.items.map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [orders, searchQuery]);

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 px-6 py-12 text-center">
        <p className="text-sm font-medium text-black">No orders yet</p>
        <p className="mt-2 text-sm text-neutral-500">
          Your pre-orders will appear here once you complete checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search orders by reference, item, or status"
        className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none transition-colors focus:border-black"
      />

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 px-6 py-10 text-center">
          <p className="text-sm font-medium text-black">No matching orders</p>
          <p className="mt-2 text-sm text-neutral-500">
            Try a different search term.
          </p>
        </div>
      ) : null}

      {filteredOrders.map((order) => {
        const fulfillmentType = (order.fulfillmentType ??
          "delivery") as FulfillmentType;
        const itemCount = order.items.reduce(
          (sum, item) => sum + (item.quantity ?? 1),
          0
        );

        return (
          <article
            key={order.id}
            className="rounded-xl border border-neutral-200 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                  {formatDate(order.createdAt)}
                </p>
                <h2 className="mt-2 text-lg font-medium text-black">
                  {order.orderReference ?? "Legacy order"}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                  {order.items.map((item) => item.name).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-black">{order.totalLabel}</p>
                {order.discountLabel ? (
                  <p className="mt-1 text-xs text-purple-950">
                    Saved {order.discountLabel.replace("-", "")}
                  </p>
                ) : null}
                <p className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  {getPaymentStatusLabel(order.paymentStatus)}
                </p>
                <p className="mt-2 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-950">
                  {getStatusLabel(order.status)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/account/orders/${order.id}/invoice`}
                className="inline-flex h-9 items-center rounded-full border border-neutral-200 px-4 text-xs font-semibold text-black transition-colors hover:border-black"
              >
                {order.paymentStatus === "confirmed"
                  ? `View invoice${order.invoiceNumber ? ` (${order.invoiceNumber})` : ""}`
                  : "Invoice pending confirmation"}
              </Link>
            </div>

            {fulfillmentType === "delivery" && order.customerLocation ? (
              <p className="mt-4 text-sm text-neutral-600">
                Delivery to {order.customerLocation}
              </p>
            ) : null}

            <OrderStatusTimeline
              fulfillmentType={fulfillmentType}
              currentStatus={order.status}
            />
          </article>
        );
      })}
    </div>
  );
}
