import { getBachsConfig } from "./config";
import type { BachsWebhookEvent } from "./types";

export class BachsWebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BachsWebhookError";
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret?: string
): BachsWebhookEvent {
  const webhookSecret = secret ?? getBachsConfig().webhookSecret;

  if (!webhookSecret) {
    throw new BachsWebhookError(
      "BACHS_WEBHOOK_SECRET is not set. Configure it in your environment variables."
    );
  }

  const expectedSignature = webhookSecret;

  if (!signature || !timingSafeEqual(signature, expectedSignature)) {
    throw new BachsWebhookError("Invalid webhook signature");
  }

  let event: BachsWebhookEvent;
  try {
    event = JSON.parse(payload) as BachsWebhookEvent;
  } catch {
    throw new BachsWebhookError("Invalid webhook payload: not valid JSON");
  }

  if (!event.type || !event.id) {
    throw new BachsWebhookError(
      "Invalid webhook payload: missing 'type' or 'id'"
    );
  }

  return event;
}
