import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  BachsWebhookError,
} from "@/app/lib/bachs/webhooks";
import {
  getPreorderByBachsCheckoutId,
  confirmPreorderByBachsCharge,
} from "@/app/lib/preorders/data";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-bachs-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-bachs-signature header" },
        { status: 401 }
      );
    }

    const payload = await request.text();
    const event = verifyWebhookSignature(payload, signature);

    switch (event.type) {
      case "collection.succeeded": {
        const data = event.data as Record<string, unknown>;
        const checkoutId = data.checkout_id as string | undefined;
        const chargeId = data.charge_id as string | null | undefined;

        if (!checkoutId) {
          break;
        }

        const preorder = await getPreorderByBachsCheckoutId(checkoutId);

        if (!preorder) {
          break;
        }

        await confirmPreorderByBachsCharge(
          preorder.id,
          chargeId ?? checkoutId,
          chargeId ?? checkoutId
        );

        break;
      }

      case "collection.failed": {
        break;
      }

      case "collection.abandoned": {
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof BachsWebhookError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
