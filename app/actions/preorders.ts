"use server";

import { revalidatePath } from "next/cache";
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

function getPriceValue(price: string) {
  const value = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function getTotalLabel(items: CartItem[]) {
  const total = items.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0
  );

  return `GHS ${new Intl.NumberFormat("en-GH", {
    maximumFractionDigits: 2,
  }).format(total)}`;
}

export async function createPreorder(
  _previousState: CreatePreorderState,
  formData: FormData
): Promise<CreatePreorderState> {
  const customerName = toFormString(formData.get("customerName"));
  const customerEmail = toFormString(formData.get("customerEmail"));
  const customerPhone = toFormString(formData.get("customerPhone"));
  const fulfillmentType = toFormString(formData.get("fulfillmentType"));
  const customerLocation = toFormString(formData.get("customerLocation"));
  const customerNotes = toFormString(formData.get("customerNotes"));
  const items = parseItems(formData.get("items"));
  const fieldErrors: CreatePreorderState["fieldErrors"] = {};

  if (!customerName) {
    fieldErrors.customerName = "Enter the customer's name.";
  }

  if (!emailPattern.test(customerEmail)) {
    fieldErrors.customerEmail = "Enter a valid email address.";
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

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    const record = await createPreorderRecord({
      customerName,
      customerEmail,
      customerPhone,
      fulfillmentType: isPickup ? "pickup" : "delivery",
      customerLocation: isDelivery ? customerLocation : undefined,
      customerNotes,
      items,
      totalLabel: getTotalLabel(items),
    });

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
