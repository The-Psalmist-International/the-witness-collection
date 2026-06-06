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
        <div className="flex flex-col gap-1 text-sm text-neutral-500 sm:flex-row sm:gap-6">
          <span>
            <strong className="text-black">{totalOrders}</strong> orders
          </span>
          <span>
            <strong className="text-black">{formatGhsAmount(totalRevenue)}</strong>{" "}
            completed revenue
          </span>
        </div>
      </div>

      <div className="mt-6 -mx-5 overflow-x-auto overscroll-x-contain px-5 md:mx-0 md:overflow-x-visible md:px-0">
        <div className="grid h-56 min-w-[34rem] grid-cols-[auto_1fr] gap-3 md:min-w-0 md:gap-4">
          <div className="flex flex-col justify-between py-1 text-[10px] text-neutral-400">
            <span>{maxOrders}</span>
            <span>{Math.ceil(maxOrders / 2)}</span>
            <span>0</span>
          </div>

          <div className="relative min-w-0 border-l border-b border-neutral-200">
            <div className="absolute inset-0 grid grid-rows-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="border-t border-dashed border-neutral-100" />
              ))}
            </div>

            <div className="relative flex h-full items-end gap-1.5 px-1 pb-8 md:gap-2 md:px-2">
              {series.map((point) => {
                const orderHeight = (point.orders / maxOrders) * 100;
                const revenueHeight = (point.revenue / maxRevenue) * 100;

                return (
                  <div
                    key={point.label}
                    className="group flex w-8 shrink-0 flex-col items-center justify-end gap-2 md:min-w-0 md:w-auto md:flex-1"
                  >
                    <div className="flex h-40 w-full items-end justify-center gap-0.5 md:gap-1">
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
                    <span className="max-w-full truncate text-center text-[9px] text-neutral-500 md:text-[10px]">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-neutral-400 md:hidden">
        Swipe horizontally to view all days.
      </p>

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
