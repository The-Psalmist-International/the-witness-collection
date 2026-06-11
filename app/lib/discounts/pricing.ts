import type { DiscountRecord, ProductDisplayPricing } from "@/app/lib/discounts/types";
import type { CartItem } from "@/app/lib/preorders/types";
import { formatGhsAmount, parsePriceLabel } from "@/app/lib/preorders/utils";

function getLineSubtotal(item: CartItem) {
  return parsePriceLabel(item.price) * item.quantity;
}

function getCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + getLineSubtotal(item), 0);
}

function applyAmountDiscount(amount: number, discount: DiscountRecord) {
  if (discount.type === "percent") {
    return (amount * discount.value) / 100;
  }

  return Math.min(amount, discount.value);
}

function isDiscountCurrentlyValid(discount: DiscountRecord, now = new Date()) {
  if (!discount.isActive) {
    return false;
  }

  if (discount.startsAt && discount.startsAt > now) {
    return false;
  }

  if (discount.endsAt && discount.endsAt < now) {
    return false;
  }

  if (
    typeof discount.maxUses === "number" &&
    discount.usedCount >= discount.maxUses
  ) {
    return false;
  }

  return true;
}

function findSecretDiscount(
  discounts: DiscountRecord[],
  discountCode?: string | null
) {
  if (!discountCode?.trim()) {
    return null;
  }

  const normalizedCode = discountCode.trim().toUpperCase();

  return (
    discounts.find(
      (discount) =>
        discount.scope === "secret" &&
        discount.code?.trim().toUpperCase() === normalizedCode &&
        isDiscountCurrentlyValid(discount)
    ) ?? null
  );
}

function findGeneralDiscount(discounts: DiscountRecord[]) {
  return (
    discounts.find(
      (discount) =>
        discount.scope === "general" && isDiscountCurrentlyValid(discount)
    ) ?? null
  );
}

function getProductDiscounts(discounts: DiscountRecord[]) {
  return discounts.filter(
    (discount) =>
      discount.scope === "product" && isDiscountCurrentlyValid(discount)
  );
}

function isProductScopedSecret(discount: DiscountRecord | null) {
  return Boolean(discount?.productIds.length);
}

export function calculateCheckoutPricing({
  items,
  discounts,
  discountCode,
}: {
  items: CartItem[];
  discounts: DiscountRecord[];
  discountCode?: string | null;
}) {
  const subtotal = getCartSubtotal(items);
  const productDiscounts = getProductDiscounts(discounts);
  const secretDiscount = findSecretDiscount(discounts, discountCode);
  const productScopedSecret = isProductScopedSecret(secretDiscount);

  let automaticProductDiscountAmount = 0;
  let secretProductDiscountAmount = 0;

  for (const item of items) {
    const lineSubtotal = getLineSubtotal(item);

    if (
      productScopedSecret &&
      secretDiscount!.productIds.includes(item.productId)
    ) {
      secretProductDiscountAmount += applyAmountDiscount(
        lineSubtotal,
        secretDiscount!
      );
      continue;
    }

    const matchingDiscount = productDiscounts.find((discount) =>
      discount.productIds.includes(item.productId)
    );

    if (matchingDiscount) {
      automaticProductDiscountAmount += applyAmountDiscount(
        lineSubtotal,
        matchingDiscount
      );
    }
  }

  const productDiscountAmount =
    automaticProductDiscountAmount + secretProductDiscountAmount;
  const remainingSubtotal = Math.max(subtotal - productDiscountAmount, 0);

  let orderDiscount: DiscountRecord | null = null;
  let orderDiscountAmount = 0;

  if (secretDiscount && !productScopedSecret) {
    orderDiscount = secretDiscount;
    orderDiscountAmount = applyAmountDiscount(remainingSubtotal, secretDiscount);
  } else if (!secretDiscount) {
    orderDiscount = findGeneralDiscount(discounts);
    if (orderDiscount) {
      orderDiscountAmount = applyAmountDiscount(remainingSubtotal, orderDiscount);
    }
  } else {
    orderDiscount = findGeneralDiscount(discounts);
    if (orderDiscount) {
      orderDiscountAmount = applyAmountDiscount(remainingSubtotal, orderDiscount);
    }
  }

  const discountAmount = Math.min(
    subtotal,
    productDiscountAmount + orderDiscountAmount
  );
  const total = Math.max(subtotal - discountAmount, 0);

  const appliedDiscountId = secretDiscount
    ? secretDiscount.id
    : orderDiscount?.id ?? null;

  return {
    subtotal,
    subtotalLabel: formatGhsAmount(subtotal),
    discountAmount,
    discountLabel:
      discountAmount > 0 ? `-${formatGhsAmount(discountAmount)}` : formatGhsAmount(0),
    total,
    totalLabel: formatGhsAmount(total),
    appliedDiscountId,
    appliedDiscountCode: secretDiscount?.code ?? null,
    appliedDiscountName: secretDiscount?.name ?? orderDiscount?.name ?? null,
    productDiscountAmount,
    orderDiscountAmount,
  };
}

export function validateSecretDiscountCode(
  discounts: DiscountRecord[],
  discountCode: string,
  items: CartItem[] = []
) {
  const normalizedCode = discountCode.trim().toUpperCase();

  if (!normalizedCode) {
    return { ok: false as const, message: "Enter a discount code." };
  }

  const discount = discounts.find(
    (entry) => entry.code?.trim().toUpperCase() === normalizedCode
  );

  if (!discount) {
    return { ok: false as const, message: "This discount code is not valid." };
  }

  if (discount.scope !== "secret") {
    return {
      ok: false as const,
      message: "This code cannot be applied manually.",
    };
  }

  if (!isDiscountCurrentlyValid(discount)) {
    return {
      ok: false as const,
      message: "This discount code is inactive or has expired.",
    };
  }

  if (discount.productIds.length > 0) {
    const hasMatchingItem = items.some((item) =>
      discount.productIds.includes(item.productId)
    );

    if (!hasMatchingItem) {
      return {
        ok: false as const,
        message: "This code does not apply to the items in your cart.",
      };
    }
  }

  return { ok: true as const, discount };
}

function getUnitDiscountAmount(
  unitPrice: number,
  productId: string,
  discounts: DiscountRecord[]
) {
  const productDiscounts = getProductDiscounts(discounts);
  const generalDiscount = findGeneralDiscount(discounts);

  let discountAmount = 0;
  const productDiscount = productDiscounts.find((discount) =>
    discount.productIds.includes(productId)
  );

  if (productDiscount) {
    discountAmount += applyAmountDiscount(unitPrice, productDiscount);
  }

  const remaining = Math.max(unitPrice - discountAmount, 0);

  if (generalDiscount) {
    discountAmount += applyAmountDiscount(remaining, generalDiscount);
  }

  return Math.min(unitPrice, discountAmount);
}

export function getUnitDisplayPricing(
  priceLabel: string,
  productId: string,
  discounts: DiscountRecord[]
): ProductDisplayPricing {
  const unitPrice = parsePriceLabel(priceLabel);
  const discountAmount = getUnitDiscountAmount(unitPrice, productId, discounts);
  const finalPrice = Math.max(unitPrice - discountAmount, 0);

  return {
    originalLabel: priceLabel,
    discountedLabel: formatGhsAmount(finalPrice),
    hasDiscount: discountAmount > 0,
  };
}

export function getLineDisplayPricing(
  priceLabel: string,
  productId: string,
  quantity: number,
  discounts: DiscountRecord[]
): ProductDisplayPricing {
  const unitPrice = parsePriceLabel(priceLabel);
  const lineSubtotal = unitPrice * quantity;
  const unitDiscount = getUnitDiscountAmount(unitPrice, productId, discounts);
  const discountAmount = Math.min(lineSubtotal, unitDiscount * quantity);
  const finalPrice = Math.max(lineSubtotal - discountAmount, 0);

  return {
    originalLabel: formatGhsAmount(lineSubtotal),
    discountedLabel: formatGhsAmount(finalPrice),
    hasDiscount: discountAmount > 0,
  };
}
