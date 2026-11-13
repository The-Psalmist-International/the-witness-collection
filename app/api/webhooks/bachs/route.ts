import { NextResponse } from "next/server";
import { verifyWebhookSignature, BachsWebhookError } from "@/app/lib/bachs/webhooks";
import { processBachsWebhook } from "@/app/lib/bachs/process-webhook";
import { getPreorderByBachsCheckoutId, getPreorderByOrderReference, updateBachsPaymentStatus } from "@/app/lib/preorders/data";

export async function POST(request: Request) {
  try {
    const event = verifyWebhookSignature(await request.text(), request.headers);
    const result = await processBachsWebhook(event, {
      findByCheckout: getPreorderByBachsCheckoutId,
      findByReference: getPreorderByOrderReference,
      update: updateBachsPaymentStatus,
    });
    return NextResponse.json(result, { status: result.retry ? 503 : 200 });
  } catch (error) {
    if (error instanceof BachsWebhookError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Bachs webhook handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
