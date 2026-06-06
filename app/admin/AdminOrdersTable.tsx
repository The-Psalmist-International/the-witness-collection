"use client";

import { useState } from "react";
import { AdminButton } from "@/app/admin/AdminButton";
import { EyeIcon } from "@/app/admin/AdminIcons";
import { OrderDetailDrawer } from "@/app/admin/OrderDetailDrawer";
import { PaginationBar } from "@/app/admin/PaginationBar";
import type { Preorder } from "@/app/lib/db/schema";

type AdminOrdersTableProps = {
  preorders: Preorder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "completed"
      ? "bg-green-50 text-green-800"
      : status === "cancelled"
        ? "bg-neutral-100 text-neutral-600"
        : "bg-purple-50 text-purple-950";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

function ViewButton({ onClick }: { onClick: () => void }) {
  return (
    <AdminButton
      variant="icon"
      aria-label="View order details"
      onClick={onClick}
      icon={<EyeIcon />}
    />
  );
}

export function AdminOrdersTable({
  preorders,
  pagination,
}: AdminOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Preorder | null>(null);

  if (preorders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-black">No pre-orders yet.</p>
        <p className="mt-2 text-sm text-neutral-500">
          New submissions from the cart will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-md border border-neutral-200 bg-white">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-medium">Created</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Address</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {preorders.map((preorder) => (
                <tr key={preorder.id} className="align-top">
                  <td className="px-5 py-5 text-sm text-neutral-500">
                    {formatDate(preorder.createdAt)}
                  </td>
                  <td className="px-5 py-5">
                    <p className="text-sm font-medium text-black">
                      {preorder.customerName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {preorder.customerEmail}
                    </p>
                  </td>
                  <td className="px-5 py-5 text-sm capitalize text-black">
                    {preorder.fulfillmentType ?? "delivery"}
                  </td>
                  <td className="max-w-xs px-5 py-5 text-sm text-neutral-600">
                    {preorder.fulfillmentType === "pickup"
                      ? "Pickup"
                      : preorder.customerLocation || "—"}
                  </td>
                  <td className="px-5 py-5 text-sm font-medium text-black">
                    {preorder.totalLabel}
                  </td>
                  <td className="px-5 py-5">
                    <StatusBadge status={preorder.status} />
                  </td>
                  <td className="px-5 py-5">
                    <ViewButton onClick={() => setSelectedOrder(preorder)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-neutral-100 lg:hidden">
          {preorders.map((preorder) => (
            <article key={preorder.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black">
                    {preorder.customerName}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatDate(preorder.createdAt)}
                  </p>
                </div>
                <ViewButton onClick={() => setSelectedOrder(preorder)} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge status={preorder.status} />
                <span className="rounded-full bg-neutral-100 px-3 py-1 capitalize text-neutral-700">
                  {preorder.fulfillmentType ?? "delivery"}
                </span>
                <span className="font-medium text-black">
                  {preorder.totalLabel}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                {preorder.fulfillmentType === "pickup"
                  ? "Pickup"
                  : preorder.customerLocation || "No address provided"}
              </p>
            </article>
          ))}
        </div>

        <PaginationBar
          basePath="/admin/orders"
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
        />
      </div>

      <OrderDetailDrawer
        preorder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
