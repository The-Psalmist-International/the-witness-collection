"use server";

import { eq } from "drizzle-orm";
import { createCheckoutSession, createProduct } from "@/app/lib/bachs/client";
import { requireCustomerSession } from "@/app/lib/customer/auth";
import { getDb } from "@/app/lib/db";
import { products } from "@/app/lib/db/schema";
import {
  calculateCheckoutPricing,
  validateSecretDiscountCode,
} from "@/app/lib/discounts/pricing";
import { listActiveDiscounts } from "@/app/lib/discounts/data";
import { createBachsPreorderRecord } from "@/app/lib/preorders/data";
import { getProductById } from "@/app/lib/products/data";
import { parsePriceLabel } from "@/app/lib/preorders/utils";
import { generateOrderReference } from "@/app/lib/payments/reference";
import { getGhsUsdRate, convertGhsToUsd } from "@/app/lib/forex";
import type { CartItem } from "@/app/lib/preorders/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BachsCheckoutState = {
  ok: boolean;
  checkoutUrl?: string;
  orderReference?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function ensureBachsProduct(
  localProductId: string,
  ghsToUsdRate: number
): Promise<string> {
  const existing = await getProductById(localProductId);

  if (!existing) {
    throw new Error(`Product '${localProductId}' not found in local database.`);
  }

  if (existing.bachsProductId) {
    return existing.bachsProductId;
  }

  const ghsAmount = parsePriceLabel(existing.price);
  const usdAmount = convertGhsToUsd(ghsAmount, ghsToUsdRate);
  const ghsFormatted = ghsAmount.toFixed(2);

  const bachsProduct = await createProduct({
    name: existing.name,
    price: {
      currency: "USD",
      amount: usdAmount,
      currency_options: [
        { currency: "GHS", amount: ghsFormatted },
      ],
    },
    metadata: {
      local_product_id: localProductId,
    },
  });

  await getDb()
    .update(products)
    .set({ bachsProductId: bachsProduct.id, updatedAt: new Date() })
    .where(eq(products.id, localProductId));

  return bachsProduct.id;
}

export async function createBachsCheckout(
  formData: FormData
): Promise<BachsCheckoutState> {
  let customerSession;

  try {
    customerSession = await requireCustomerSession();
  } catch {
    return { ok: false, error: "Sign in to complete your pre-order." };
  }

  const customerName = (formData.get("customerName") as string)?.trim() ?? "";
  const customerEmail =
    (formData.get("customerEmail") as string)?.trim() ?? "";
  const customerPhone =
    (formData.get("customerPhone") as string)?.trim() ?? "";
  const fulfillmentType =
    (formData.get("fulfillmentType") as string)?.trim() ?? "";
  const customerLocation =
    (formData.get("customerLocation") as string)?.trim() ?? "";
  const customerNotes =
    (formData.get("customerNotes") as string)?.trim() ?? "";
  const discountCode =
    (formData.get("discountCode") as string)?.trim() ?? "";
  const rawItems = formData.get("items");
  let items: CartItem[] = [];

  try {
    items =
      typeof rawItems === "string"
        ? (JSON.parse(rawItems) as CartItem[])
        : [];
  } catch {
    return { ok: false, error: "Invalid cart data." };
  }

  const fieldErrors: Record<string, string> = {};

  if (!customerName) fieldErrors.customerName = "Enter the customer's name.";
  if (!emailPattern.test(customerEmail))
    fieldErrors.customerEmail = "Enter a valid email address.";
  if (customerEmail !== customerSession.email)
    fieldErrors.customerEmail = "Use the email on your signed-in account.";
  if (!customerPhone) fieldErrors.customerPhone = "Enter a phone number.";

  const isPickup = fulfillmentType === "pickup";
  const isDelivery = fulfillmentType === "delivery";

  if (!isPickup && !isDelivery)
    fieldErrors.fulfillmentType = "Choose pickup or delivery.";
  if (isDelivery && !customerLocation)
    fieldErrors.customerLocation = "Enter a delivery address.";
  if (items.length === 0) fieldErrors.items = "Select at least one item.";

  const discounts = await listActiveDiscounts();

  if (discountCode) {
    const validation = validateSecretDiscountCode(discounts, discountCode, items);
    if (!validation.ok) fieldErrors.discountCode = validation.message;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Check the highlighted fields.", fieldErrors };
  }

  let ghsToUsdRate: number;
  try {
    ghsToUsdRate = await getGhsUsdRate();
  } catch {
    return { ok: false, error: "Could not fetch exchange rate. Try again." };
  }

  const pricing = calculateCheckoutPricing({
    items,
    discounts,
    discountCode: discountCode || null,
    ghsToUsdRate,
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const orderReference = generateOrderReference();

  try {
    const productCart = await Promise.all(
      items.map(async (item) => {
        const bachsProductId = await ensureBachsProduct(
          item.productId,
          ghsToUsdRate
        );
        return { product_id: bachsProductId, quantity: item.quantity };
      })
    );

    const checkout = await createCheckoutSession({
      customer: {
        email: customerEmail,
        name: customerName,
        phone_number: customerPhone,
      },
      product_cart: productCart,
      billing_currency: "GHS",
      reference: orderReference,
      metadata: {
        customer_id: customerSession.userId,
        fulfillment_type: fulfillmentType,
        ...(customerLocation ? { customer_location: customerLocation } : {}),
        ...(customerNotes ? { customer_notes: customerNotes } : {}),
        ...(pricing.subtotalLabel
          ? { subtotal_label: pricing.subtotalLabel }
          : {}),
        ...(pricing.appliedDiscountId
          ? { discount_id: pricing.appliedDiscountId }
          : {}),
      },
      success_url: `${appUrl}/receipt?ref=${orderReference}`,
      cancel_url: `${appUrl}/shop`,
    });

    const record = await createBachsPreorderRecord({
      customerId: customerSession.userId,
      customerName,
      customerEmail,
      customerPhone,
      fulfillmentType: isPickup ? "pickup" : "delivery",
      customerLocation: isDelivery ? customerLocation : undefined,
      customerNotes,
      items,
      subtotalLabel: pricing.subtotalLabel,
      discountLabel:
        pricing.discountAmount > 0 ? pricing.discountLabel : undefined,
      discountCode: pricing.appliedDiscountCode ?? undefined,
      discountId: pricing.appliedDiscountId ?? undefined,
      totalLabel: pricing.totalLabel,
      bachsCheckoutId: checkout.checkout_id,
      orderReference,
    });

    if (pricing.appliedDiscountId) {
      const { incrementDiscountUsage } = await import(
        "@/app/lib/discounts/data"
      );
      await incrementDiscountUsage(pricing.appliedDiscountId);
    }

    return {
      ok: true,
      checkoutUrl: checkout.checkout_url,
      orderReference: record?.orderReference ?? undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create checkout.";
    return { ok: false, error: message };
  }
}
