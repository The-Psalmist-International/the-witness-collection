import { parsePriceLabel } from "@/app/lib/preorders/utils";

export type GrowthPoint = {
  label: string;
  orders: number;
  revenue: number;
};

type GrowthOrder = {
  status: string;
  totalLabel: string;
  createdAt: Date;
};

export function buildGrowthSeries(preorders: GrowthOrder[], days = 14): GrowthPoint[] {
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

export function getPreorderSummaryFromCounts(
  statusCounts: { status: string; total: number }[],
  completedRevenueOrders: { totalLabel: string }[] = []
) {
  const countByStatus = new Map(
    statusCounts.map((row) => [row.status, Number(row.total)])
  );

  const revenue = completedRevenueOrders.reduce(
    (sum, order) => sum + parsePriceLabel(order.totalLabel),
    0
  );

  return {
    totalOrders: statusCounts.reduce((sum, row) => sum + Number(row.total), 0),
    pendingOrders: countByStatus.get("pending") ?? 0,
    completedOrders: countByStatus.get("completed") ?? 0,
    cancelledOrders: countByStatus.get("cancelled") ?? 0,
    revenue,
  };
}

export function getPreorderSummary(preorders: GrowthOrder[]) {
  const statusCounts = ["pending", "completed", "cancelled"].map((status) => ({
    status,
    total: preorders.filter((order) => order.status === status).length,
  }));

  return getPreorderSummaryFromCounts(statusCounts, preorders);
}
