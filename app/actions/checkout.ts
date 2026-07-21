"use server";

import { listActiveDiscounts } from "@/app/lib/discounts/data";
import { calculateCheckoutPricing } from "@/app/lib/discounts/pricing";
import { getGhsUsdRate } from "@/app/lib/forex";
import type { CartItem } from "@/app/lib/preorders/types";

export async function previewCheckoutPricing(
  items: CartItem[],
  discountCode?: string | null
) {
  const discounts = await listActiveDiscounts();

  let ghsToUsdRate: number | undefined;
  try {
    ghsToUsdRate = await getGhsUsdRate();
  } catch {
    // FX rate unavailable, skip USD conversion
  }

  return calculateCheckoutPricing({
    items,
    discounts,
    discountCode,
    ghsToUsdRate,
  });
}
