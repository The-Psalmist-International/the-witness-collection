import type { GrowthPoint } from "@/app/lib/preorders/analytics";
import { formatGhsAmount } from "@/app/lib/preorders/utils";

type AdminGrowthChartProps = {
  series: GrowthPoint[];
};

export function AdminGrowthChart({ series }: AdminGrowthChartProps) {
  const maxOrders = Math.max(...series.map((point) => point.orders), 1);
  const maxRevenue = Math.max(...series.map((point) => point.revenue), 1);
  const totalOrders = series.reduce((sum, point) => sum + point.orders, 0);
  const totalRevenue = series.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Growth
          </p>
          <h2 className="mt-2 text-xl font-medium tracking-tight text-black">
            Orders & revenue (last 14 days)
          </h2>
        </div>
        <div className="flex gap-6 text-sm text-neutral-500">
          <span>
            <strong className="text-black">{totalOrders}</strong> orders
          </span>
          <span>
            <strong className="text-black">{formatGhsAmount(totalRevenue)}</strong>{" "}
            completed revenue
          </span>
        </div>
      </div>

      <div className="mt-8 grid h-56 grid-cols-[auto_1fr] gap-4">
        <div className="flex flex-col justify-between py-1 text-[10px] text-neutral-400">
          <span>{maxOrders}</span>
          <span>{Math.ceil(maxOrders / 2)}</span>
          <span>0</span>
        </div>

        <div className="relative border-l border-b border-neutral-200">
          <div className="absolute inset-0 grid grid-rows-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-t border-dashed border-neutral-100" />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-2 px-2 pb-8">
            {series.map((point) => {
              const orderHeight = (point.orders / maxOrders) * 100;
              const revenueHeight = (point.revenue / maxRevenue) * 100;

              return (
                <div
                  key={point.label}
                  className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-40 w-full items-end justify-center gap-1">
                    <div
                      className="w-2 rounded-t-sm bg-purple-950/80 transition-all group-hover:bg-purple-950"
                      style={{ height: `${Math.max(orderHeight, point.orders > 0 ? 8 : 0)}%` }}
                      title={`${point.orders} orders`}
                    />
                    <div
                      className="w-2 rounded-t-sm bg-green-600/70 transition-all group-hover:bg-green-600"
                      style={{
                        height: `${Math.max(revenueHeight, point.revenue > 0 ? 8 : 0)}%`,
                      }}
                      title={formatGhsAmount(point.revenue)}
                    />
                  </div>
                  <span className="truncate text-[10px] text-neutral-500">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-purple-950" />
          Orders
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-600" />
          Completed revenue
        </span>
      </div>
    </section>
  );
}
