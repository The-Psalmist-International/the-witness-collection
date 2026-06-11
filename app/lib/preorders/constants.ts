export const PREORDER_STATUSES = [
  "pending",
  "processing",
  "packed",
  "out_for_delivery",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

export type PreorderStatus = (typeof PREORDER_STATUSES)[number];

export const PREORDER_STATUS_LABELS: Record<PreorderStatus, string> = {
  pending: "Order received",
  processing: "Processing",
  packed: "Order packed",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const FULFILLMENT_TYPES = ["pickup", "delivery"] as const;

export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const PICKUP_DETAILS =
  "You will be contacted with pickup instructions and directed to our collection point for pickup.";

export function getStatusesForFulfillment(
  fulfillmentType: FulfillmentType
): PreorderStatus[] {
  if (fulfillmentType === "delivery") {
    return [
      "pending",
      "processing",
      "packed",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];
  }

  return [
    "pending",
    "processing",
    "packed",
    "ready_for_pickup",
    "completed",
    "cancelled",
  ];
}

export function getOrderTrackingSteps(
  fulfillmentType: FulfillmentType
): PreorderStatus[] {
  if (fulfillmentType === "delivery") {
    return ["pending", "processing", "packed", "out_for_delivery", "completed"];
  }

  return ["pending", "processing", "packed", "ready_for_pickup", "completed"];
}

export function getStatusLabel(status: string) {
  return (
    PREORDER_STATUS_LABELS[status as PreorderStatus] ??
    status.replace(/_/g, " ")
  );
}
