"use client";

import { useDiscounts } from "@/app/components/DiscountProvider";
import {
  getLineDisplayPricing,
  getUnitDisplayPricing,
} from "@/app/lib/discounts/pricing";

type ProductPriceProps = {
  price: string;
  productId: string;
  className?: string;
  discountedClassName?: string;
  originalClassName?: string;
};

export function ProductPrice({
  price,
  productId,
  className = "",
  discountedClassName = "font-medium text-purple-950",
  originalClassName = "text-neutral-400 line-through",
}: ProductPriceProps) {
  const { discounts } = useDiscounts();
  const display = getUnitDisplayPricing(price, productId, discounts);

  if (!display.hasDiscount) {
    return <span className={className}>{price}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <span className={originalClassName}>{display.originalLabel}</span>
      <span className={discountedClassName}>{display.discountedLabel}</span>
    </span>
  );
}

export function CartLinePrice({
  price,
  productId,
  quantity,
}: {
  price: string;
  productId: string;
  quantity: number;
}) {
  const { discounts } = useDiscounts();
  const display = getLineDisplayPricing(price, productId, quantity, discounts);

  if (!display.hasDiscount) {
    return <span>{price}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-neutral-400 line-through">{display.originalLabel}</span>
      <span className="font-medium text-purple-950">{display.discountedLabel}</span>
    </span>
  );
}
