import { randomBytes } from "crypto";

export function generateOrderReference() {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `TWC-${stamp}${suffix}`;
}

export function generateInvoiceNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `TWC-INV-${stamp}-${suffix}`;
}

export function formatOrderReference(
  orderReference: string | null | undefined,
  fallbackId?: string
) {
  if (orderReference) {
    return orderReference;
  }

  if (fallbackId) {
    return `Order ${fallbackId.slice(0, 8)}`;
  }

  return "Legacy order";
}
