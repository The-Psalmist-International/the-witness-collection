import type { BachsWebhookEvent } from "./types";

const statuses = {
  "collection.succeeded": "confirmed",
  "collection.failed": "checkout_failed",
  "collection.abandoned": "checkout_abandoned",
  "collection.underpaid": "checkout_underpaid",
  "checkout.expired": "checkout_expired",
} as const;

export type BachsPaymentStatus = (typeof statuses)[keyof typeof statuses];
type Order = { id: string; bachsCheckoutId: string | null };
type Dependencies = {
  findByCheckout: (id: string) => Promise<Order | null>;
  findByReference: (reference: string) => Promise<Order | null>;
  update: (id: string, status: BachsPaymentStatus, chargeId: string | null, paymentId: string | null) => Promise<unknown>;
};

function identifier(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function processBachsWebhook(event: BachsWebhookEvent, deps: Dependencies) {
  const status = statuses[event.type as keyof typeof statuses];
  if (!status) return { received: true, ignored: true };
  const checkoutId = identifier(event.data.checkout_id);
  const reference = identifier(event.data.reference);
  // Unrelated virtual-account deposits may have neither order identifier.
  if (!checkoutId && !reference) {
    console.warn("Bachs event has no order identifiers", { eventId: event.id, type: event.type });
    return { received: true, ignored: true };
  }
  let order = checkoutId ? await deps.findByCheckout(checkoutId) : null;
  if (!order && reference) order = await deps.findByReference(reference);
  if (!order || !order.bachsCheckoutId || (checkoutId && order.bachsCheckoutId !== checkoutId)) {
    console.error("Bachs event could not match checkout order", { eventId: event.id, checkoutId, reference });
    return { received: false, retry: true };
  }
  await deps.update(order.id, status, identifier(event.data.charge_id), identifier(event.data.payment_id));
  return { received: true };
}
