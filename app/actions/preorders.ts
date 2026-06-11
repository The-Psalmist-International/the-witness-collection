"use server";

import { revalidatePath } from "next/cache";
import {
  incrementDiscountUsage,
  listActiveDiscounts,
} from "@/app/lib/discounts/data";
import {
  calculateCheckoutPricing,
  validateSecretDiscountCode,
} from "@/app/lib/discounts/pricing";
import { requireCustomerSession } from "@/app/lib/customer/auth";
import { createPreorderRecord } from "@/app/lib/preorders/data";
import type {
  CartItem,
  CreatePreorderState,
} from "@/app/lib/preorders/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toFormString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 16);
}

function parseItems(value: FormDataEntryValue | null): CartItem[] {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry): CartItem | null => {
        if (!isRecord(entry)) {
          return null;
        }

        const productId = readString(entry.productId);
        const name = readString(entry.name);
        const price = readString(entry.price);
        const image = readString(entry.image);
        const selectedSize = readString(entry.selectedSize);
        const sizes = readStringArray(entry.sizes);
        const category = readString(entry.category);
        const rawQuantity = entry.quantity;
        const quantity =
          typeof rawQuantity === "number" && Number.isFinite(rawQuantity)
            ? Math.min(Math.max(Math.trunc(rawQuantity), 1), 99)
            : 1;

        if (!productId || !name || !price || !selectedSize) {
          return null;
        }

        return {
          productId,
          name,
          price,
          image,
          selectedSize,
          sizes,
          quantity,
          ...(category ? { category } : {}),
        };
      })
      .filter((item): item is CartItem => Boolean(item))
      .slice(0, 20);
  } catch {
    return [];
  }
}

export async function createPreorder(
  _previousState: CreatePreorderState,
  formData: FormData
): Promise<CreatePreorderState> {
  let customerSession;

  try {
    customerSession = await requireCustomerSession();
  } catch {
    return {
      status: "error",
      message: "Sign in to complete your pre-order.",
      fieldErrors: {
        auth: "You must be signed in before checking out.",
      },
    };
  }

  const customerName = toFormString(formData.get("customerName"));
  const customerEmail = toFormString(formData.get("customerEmail"));
  const customerPhone = toFormString(formData.get("customerPhone"));
  const fulfillmentType = toFormString(formData.get("fulfillmentType"));
  const customerLocation = toFormString(formData.get("customerLocation"));
  const customerNotes = toFormString(formData.get("customerNotes"));
  const discountCode = toFormString(formData.get("discountCode"));
  const items = parseItems(formData.get("items"));
  const fieldErrors: CreatePreorderState["fieldErrors"] = {};

  if (!customerName) {
    fieldErrors.customerName = "Enter the customer's name.";
  }

  if (!emailPattern.test(customerEmail)) {
    fieldErrors.customerEmail = "Enter a valid email address.";
  }

  if (customerEmail !== customerSession.email) {
    fieldErrors.customerEmail = "Use the email on your signed-in account.";
  }

  if (!customerPhone) {
    fieldErrors.customerPhone = "Enter a phone number.";
  }

  const isPickup = fulfillmentType === "pickup";
  const isDelivery = fulfillmentType === "delivery";

  if (!isPickup && !isDelivery) {
    fieldErrors.fulfillmentType = "Choose pickup or delivery.";
  }

  if (isDelivery && !customerLocation) {
    fieldErrors.customerLocation = "Enter a delivery address.";
  }

  if (items.length === 0) {
    fieldErrors.items = "Select at least one item before pre-ordering.";
  }

  const discounts = await listActiveDiscounts();

  if (discountCode) {
    const secretValidation = validateSecretDiscountCode(discounts, discountCode);

    if (!secretValidation.ok) {
      fieldErrors.discountCode = secretValidation.message;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const pricing = calculateCheckoutPricing({
    items,
    discounts,
    discountCode: discountCode || null,
  });

  try {
    const record = await createPreorderRecord({
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
    });

    if (pricing.appliedDiscountId) {
      await incrementDiscountUsage(pricing.appliedDiscountId);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return {
      status: "success",
      message: "Pre-order received. We will follow up with confirmation.",
      preorderId: record?.id,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "Pre-orders are not connected yet. Set DATABASE_URL to your Neon connection string."
        : "We could not save this pre-order. Please try again.";

    return {
      status: "error",
      message,
    };
  }
}
