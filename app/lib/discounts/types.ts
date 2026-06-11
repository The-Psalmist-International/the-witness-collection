export const DISCOUNT_TYPES = ["fixed", "percent"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_SCOPES = ["general", "product", "secret"] as const;
export type DiscountScope = (typeof DISCOUNT_SCOPES)[number];

export type DiscountRecord = {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  code: string | null;
  productIds: string[];
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
};

export type CheckoutPricing = {
  subtotal: number;
  subtotalLabel: string;
  discountAmount: number;
  discountLabel: string;
  total: number;
  totalLabel: string;
  appliedDiscountId: string | null;
  appliedDiscountCode: string | null;
  appliedDiscountName: string | null;
  productDiscountAmount: number;
  orderDiscountAmount: number;
};

export type ProductDisplayPricing = {
  originalLabel: string;
  discountedLabel: string;
  hasDiscount: boolean;
};
