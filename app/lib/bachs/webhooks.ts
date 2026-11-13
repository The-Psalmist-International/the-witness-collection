import { createHmac, timingSafeEqual } from "node:crypto";
import type { BachsWebhookEvent } from "./types";

export class BachsWebhookError extends Error {
  constructor(message: string, public readonly status = 401) {
    super(message);
    this.name = "BachsWebhookError";
  }
}

export function verifyWebhookSignature(
  payload: string,
  headers: Headers,
  secret = process.env.BACHS_WEBHOOK_SECRET,
): BachsWebhookEvent {
  if (!secret) throw new Error("BACHS_WEBHOOK_SECRET is not configured.");
  const v2 = headers.get("x-bachs-signature-v2");
  const parts = v2?.split(",").map((part) => part.trim());
  const timestamp = v2
    ? parts?.find((part) => part.startsWith("t="))?.slice(2)
    : headers.get("x-bachs-timestamp");
  const signatures = v2
    ? parts?.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3))
    : [headers.get("x-bachs-signature") ?? ""];
  if (!timestamp || !/^\d+$/.test(timestamp) ||
      Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw new BachsWebhookError("Missing or expired webhook timestamp");
  }
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest();
  const valid = signatures?.some((signature) =>
    /^[a-fA-F0-9]{64}$/.test(signature) &&
    timingSafeEqual(Buffer.from(signature, "hex"), expected),
  );
  if (!valid) throw new BachsWebhookError("Invalid webhook signature");
  let event: BachsWebhookEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    throw new BachsWebhookError("Invalid webhook JSON", 400);
  }
  if (!event || typeof event.id !== "string" || !event.id ||
      typeof event.type !== "string" || !event.type ||
      !event.data || typeof event.data !== "object" || Array.isArray(event.data)) {
    throw new BachsWebhookError("Invalid webhook event", 400);
  }
  return event;
}
