"use server";

import { listActiveDiscounts } from "@/app/lib/discounts/data";
import { calculateCheckoutPricing } from "@/app/lib/discounts/pricing";
import type { CartItem } from "@/app/lib/preorders/types";

export async function previewCheckoutPricing(
  items: CartItem[],
  discountCode?: string | null
) {
  const discounts = await listActiveDiscounts();

  return calculateCheckoutPricing({
    items,
    discounts,
    discountCode,
  });
}
