export const PREORDER_STATUSES = ["pending", "completed", "cancelled"] as const;

export type PreorderStatus = (typeof PREORDER_STATUSES)[number];

export const FULFILLMENT_TYPES = ["pickup", "delivery"] as const;

export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const PICKUP_DETAILS =
  "You will be contacted with pickup instructions and directed to our collection point for pickup.";
