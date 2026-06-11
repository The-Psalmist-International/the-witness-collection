"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  confirmPaymentAction,
  rejectPaymentAction,
} from "@/app/admin/actions";
import { AdminButton } from "@/app/admin/AdminButton";
import { PaginationBar } from "@/app/admin/PaginationBar";
import type { Preorder } from "@/app/lib/db/schema";
import { getAdminPaymentStatusLabel } from "@/app/lib/payments/constants";
import { formatOrderReference } from "@/app/lib/payments/reference";
import { PaymentProofPreview } from "@/app/admin/PaymentProofPreview";

type AdminPaymentsTableProps = {
  preorders: Preorder[];
  searchQuery?: string;
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

export function AdminPaymentsTable({
  preorders,
  searchQuery,
  pagination,
}: AdminPaymentsTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (preorders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-black">
          No payments awaiting confirmation.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          New payment proofs will appear here after checkout.
        </p>
      </div>
    );
  }

  const handleConfirm = (preorderId: string) => {
    setPendingId(preorderId);
    startTransition(async () => {
      await confirmPaymentAction(preorderId);
      setPendingId(null);
    });
  };

  const handleReject = (preorderId: string) => {
    setPendingId(preorderId);
    startTransition(async () => {
      await rejectPaymentAction(preorderId);
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {preorders.map((preorder) => {
        const busy = isPending && pendingId === preorder.id;

        return (
          <article
            key={preorder.id}
            className="rounded-md border border-neutral-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                  {formatDate(preorder.createdAt)}
                </p>
                <h2 className="mt-2 text-lg font-medium text-black">
                  {preorder.orderReference}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {preorder.customerName} · {preorder.customerEmail}
                </p>
                <p className="mt-1 text-sm font-medium text-purple-950">
                  {preorder.totalLabel}
                </p>
                <p className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  {getAdminPaymentStatusLabel(preorder.paymentStatus)}
                </p>
              </div>

              {preorder.paymentProofUrl ? (
                <PaymentProofPreview
                  url={preorder.paymentProofUrl}
                  alt={`Payment proof for ${formatOrderReference(preorder.orderReference, preorder.id)}`}
                />
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <AdminButton
                disabled={busy}
                onClick={() => handleConfirm(preorder.id)}
              >
                {busy ? "Confirming…" : "Confirm payment"}
              </AdminButton>
              <AdminButton
                variant="secondary"
                disabled={busy}
                onClick={() => handleReject(preorder.id)}
              >
                Reject
              </AdminButton>
              <Link
                href={`/admin/orders?q=${encodeURIComponent(formatOrderReference(preorder.orderReference, preorder.id))}`}
                className="inline-flex h-10 items-center rounded-md border border-neutral-200 px-4 text-sm font-medium text-black transition-colors hover:border-black"
              >
                View order
              </Link>
            </div>
          </article>
        );
      })}

      <PaginationBar
        basePath="/admin/payments"
        searchQuery={searchQuery}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
      />
    </div>
  );
}
