import type { DiscountRecord } from "@/app/lib/discounts/types";
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

  let productDiscountAmount = 0;

  for (const item of items) {
    const lineSubtotal = getLineSubtotal(item);
    const matchingDiscount = productDiscounts.find((discount) =>
      discount.productIds.includes(item.productId)
    );

    if (matchingDiscount) {
      productDiscountAmount += applyAmountDiscount(
        lineSubtotal,
        matchingDiscount
      );
    }
  }

  const secretDiscount = findSecretDiscount(discounts, discountCode);
  const generalDiscount = secretDiscount ? null : findGeneralDiscount(discounts);
  const orderDiscount = secretDiscount ?? generalDiscount;

  const remainingSubtotal = Math.max(subtotal - productDiscountAmount, 0);
  const orderDiscountAmount = orderDiscount
    ? applyAmountDiscount(remainingSubtotal, orderDiscount)
    : 0;

  const discountAmount = Math.min(
    subtotal,
    productDiscountAmount + orderDiscountAmount
  );
  const total = Math.max(subtotal - discountAmount, 0);

  return {
    subtotal,
    subtotalLabel: formatGhsAmount(subtotal),
    discountAmount,
    discountLabel:
      discountAmount > 0 ? `-${formatGhsAmount(discountAmount)}` : formatGhsAmount(0),
    total,
    totalLabel: formatGhsAmount(total),
    appliedDiscountId: orderDiscount?.id ?? null,
    appliedDiscountCode: orderDiscount?.code ?? null,
    appliedDiscountName: orderDiscount?.name ?? null,
    productDiscountAmount,
    orderDiscountAmount,
  };
}

export function validateSecretDiscountCode(
  discounts: DiscountRecord[],
  discountCode: string
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

  return { ok: true as const, discount };
}
