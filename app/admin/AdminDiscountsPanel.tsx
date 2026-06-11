"use client";

import { useState, useTransition } from "react";
import {
  cancelDiscountAction,
  reactivateDiscountAction,
  suspendDiscountAction,
} from "@/app/admin/actions";
import { AddDiscountDrawer } from "@/app/admin/AddDiscountDrawer";
import { AdminButton } from "@/app/admin/AdminButton";
import { PlusIcon } from "@/app/admin/AdminIcons";
import type { ProductRecord } from "@/app/lib/db/schema";
import type { DiscountRecord } from "@/app/lib/discounts/types";

type AdminDiscountsPanelProps = {
  discounts: DiscountRecord[];
  products: ProductRecord[];
};

type DiscountLifecycleStatus = "active" | "scheduled" | "suspended" | "ended";

function formatDiscountValue(discount: DiscountRecord) {
  if (discount.type === "percent") {
    return `${discount.value}%`;
  }

  return `GHS ${discount.value}`;
}

function formatScope(scope: DiscountRecord["scope"]) {
  if (scope === "general") return "General";
  if (scope === "product") return "Product";
  return "Secret code";
}

function formatSchedule(discount: DiscountRecord) {
  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (!discount.startsAt && !discount.endsAt) {
    return "Always active";
  }

  if (discount.startsAt && discount.endsAt) {
    return `${formatter.format(discount.startsAt)} – ${formatter.format(discount.endsAt)}`;
  }

  if (discount.startsAt) {
    return `From ${formatter.format(discount.startsAt)}`;
  }

  return `Until ${formatter.format(discount.endsAt!)}`;
}

function getDiscountStatus(discount: DiscountRecord): DiscountLifecycleStatus {
  const now = new Date();

  if (!discount.isActive) {
    if (discount.endsAt && discount.endsAt <= now) {
      return "ended";
    }

    return "suspended";
  }

  if (discount.startsAt && discount.startsAt > now) {
    return "scheduled";
  }

  return "active";
}

function StatusBadge({ status }: { status: DiscountLifecycleStatus }) {
  const styles = {
    active: "bg-purple-50 text-purple-950",
    scheduled: "bg-amber-50 text-amber-900",
    suspended: "bg-neutral-100 text-neutral-600",
    ended: "bg-red-50 text-red-700",
  } as const;

  const labels = {
    active: "Active",
    scheduled: "Scheduled",
    suspended: "Suspended",
    ended: "Ended",
  } as const;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function AdminDiscountsPanel({
  discounts,
  products,
}: AdminDiscountsPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const runAction = (action: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Promotions
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight text-black">
            Discounts
          </h2>
        </div>
        <AdminButton icon={<PlusIcon />} onClick={() => setIsDrawerOpen(true)}>
          Add discount
        </AdminButton>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Scope</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 font-medium">Uses</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-neutral-500">
                  No discounts yet. Create a general, product, or secret discount.
                </td>
              </tr>
            ) : (
              discounts.map((discount) => {
                const status = getDiscountStatus(discount);
                const canSuspend = status === "active" || status === "scheduled";
                const canReactivate = status === "suspended";
                const canEndNow = status !== "ended";

                return (
                  <tr
                    key={discount.id}
                    className="border-b border-neutral-100 last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium text-black">
                      {discount.name}
                    </td>
                    <td className="px-4 py-4 capitalize text-neutral-600">
                      {discount.type}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {formatDiscountValue(discount)}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {formatScope(discount.scope)}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {discount.code ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {formatSchedule(discount)}
                    </td>
                    <td className="px-4 py-4 text-neutral-600">
                      {discount.usedCount}
                      {discount.maxUses ? ` / ${discount.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {canSuspend ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              runAction(() =>
                                suspendDiscountAction(discount.id)
                              )
                            }
                            className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-purple-950 hover:text-purple-950 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        ) : null}
                        {canReactivate ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              runAction(() =>
                                reactivateDiscountAction(discount.id)
                              )
                            }
                            className="rounded-full border border-purple-950 px-3 py-1 text-xs font-medium text-purple-950 transition-colors hover:bg-purple-50 disabled:opacity-50"
                          >
                            Reactivate
                          </button>
                        ) : null}
                        {canEndNow ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              runAction(() => cancelDiscountAction(discount.id))
                            }
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            End now
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddDiscountDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        products={products}
      />
    </>
  );
}
