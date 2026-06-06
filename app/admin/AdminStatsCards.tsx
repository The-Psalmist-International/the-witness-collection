import { formatGhsAmount } from "@/app/lib/preorders/utils";

type AdminStatsCardsProps = {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    revenue: number;
  };
};

export function AdminStatsCards({ summary }: AdminStatsCardsProps) {
  const cards = [
    { label: "Total orders", value: String(summary.totalOrders) },
    { label: "Pending", value: String(summary.pendingOrders) },
    { label: "Completed", value: String(summary.completedOrders) },
    { label: "Cancelled", value: String(summary.cancelledOrders) },
    { label: "Revenue", value: formatGhsAmount(summary.revenue) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-md border border-neutral-200 bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight text-black">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}
