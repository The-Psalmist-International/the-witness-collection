import type { Preorder } from "@/app/lib/db/schema";
import { parsePriceLabel } from "@/app/lib/preorders/utils";

export type GrowthPoint = {
  label: string;
  orders: number;
  revenue: number;
};

export function buildGrowthSeries(preorders: Preorder[], days = 14): GrowthPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));

    return {
      date,
      label: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(date),
      orders: 0,
      revenue: 0,
    };
  });

  for (const preorder of preorders) {
    const created = new Date(preorder.createdAt);
    created.setHours(0, 0, 0, 0);

    const bucket = buckets.find(
      (entry) => entry.date.getTime() === created.getTime()
    );

    if (!bucket) {
      continue;
    }

    bucket.orders += 1;

    if (preorder.status === "completed") {
      bucket.revenue += parsePriceLabel(preorder.totalLabel);
    }
  }

  return buckets.map(({ label, orders, revenue }) => ({
    label,
    orders,
    revenue,
  }));
}

export function getPreorderSummary(preorders: Preorder[]) {
  const totalOrders = preorders.length;
  const pendingOrders = preorders.filter((o) => o.status === "pending").length;
  const completedOrders = preorders.filter((o) => o.status === "completed").length;
  const cancelledOrders = preorders.filter((o) => o.status === "cancelled").length;
  const revenue = preorders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parsePriceLabel(o.totalLabel), 0);

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    revenue,
  };
}
