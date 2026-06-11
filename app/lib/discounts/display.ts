import type { DiscountRecord } from "@/app/lib/discounts/types";

export function isDiscountLive(discount: DiscountRecord, now = new Date()) {
  if (!discount.isActive) {
    return false;
  }

  if (discount.startsAt && discount.startsAt > now) {
    return false;
  }

  if (discount.endsAt && discount.endsAt <= now) {
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

export function getActiveGeneralDiscount(discounts: DiscountRecord[]) {
  return (
    discounts.find(
      (discount) => discount.scope === "general" && isDiscountLive(discount)
    ) ?? null
  );
}

export function formatDiscountBannerValue(discount: DiscountRecord) {
  if (discount.type === "percent") {
    return `${discount.value}% off`;
  }

  return `GHS ${discount.value} off`;
}

export function formatCountdown(target: Date, now = new Date()) {
  const diffMs = Math.max(target.getTime() - now.getTime(), 0);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}
