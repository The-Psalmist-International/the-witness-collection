"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { DiscountRecord } from "@/app/lib/discounts/types";
import { getActiveGeneralDiscount } from "@/app/lib/discounts/display";

type DiscountContextValue = {
  discounts: DiscountRecord[];
  generalDiscount: DiscountRecord | null;
};

const DiscountContext = createContext<DiscountContextValue>({
  discounts: [],
  generalDiscount: null,
});

export function DiscountProvider({
  discounts,
  children,
}: {
  discounts: DiscountRecord[];
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      discounts,
      generalDiscount: getActiveGeneralDiscount(discounts),
    }),
    [discounts]
  );

  return (
    <DiscountContext.Provider value={value}>{children}</DiscountContext.Provider>
  );
}

export function useDiscounts() {
  return useContext(DiscountContext);
}
