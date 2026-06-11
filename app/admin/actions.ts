"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/app/lib/admin/auth";
import {
  hasPermission,
  isAdminRole,
  type AdminPermission,
} from "@/app/lib/admin/roles";
import {
  createAdminUser,
  getAdminUserByEmail,
  setAdminUserStatus,
} from "@/app/lib/admin/users/data";
import { sendAdminEmail } from "@/app/lib/mailer/smtp";
import { buildAdminWelcomeEmail } from "@/app/lib/mailer/templates/adminWelcome";

import {
  PREORDER_STATUSES,
  type PreorderStatus,
} from "@/app/lib/preorders/constants";
import {
  confirmPreorderPayment,
  rejectPreorderPayment,
  updatePreorderStatus,
} from "@/app/lib/preorders/data";
import { PRODUCT_CATEGORIES } from "@/app/lib/products/categories";
import { buildOrderInvoiceEmail } from "@/app/lib/mailer/templates/orderInvoice";
import {
  cancelDiscountNow,
  createDiscount,
  reactivateDiscount,
  setDiscountActive,
  suspendDiscount,
} from "@/app/lib/discounts/data";
import {
  DISCOUNT_SCOPES,
  DISCOUNT_TYPES,
  type DiscountScope,
  type DiscountType,
} from "@/app/lib/discounts/types";
import {
  createProduct,
  setProductActive,
  updateProduct,
} from "@/app/lib/products/data";

async function requirePermission(permission: AdminPermission) {
  const session = await requireAdminSession();

  if (session.mustResetPassword) {
    throw new Error("Password reset required.");
  }

  if (!hasPermission(session.role, permission)) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function addAdminUser(formData: FormData) {
  const session = await requirePermission("users");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!firstName || !lastName || !email || !phone) {
    throw new Error("First name, last name, email, and phone are required.");
  }

  if (!isAdminRole(role)) {
    throw new Error("Select a valid role.");
  }

  const existing = await getAdminUserByEmail(email);

  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const { user, temporaryPassword } = await createAdminUser({
    email,
    firstName,
    lastName,
    phone,
    role,
    createdBy: session.userId,
  });

  const emailContent = buildAdminWelcomeEmail({
    email: user.email,
    firstName: user.firstName ?? firstName,
    role: user.role,
    temporaryPassword,
  });

  await sendAdminEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  revalidatePath("/admin/users");
}

export async function suspendAdminUser(userId: string) {
  const session = await requirePermission("users");

  if (session.userId === userId) {
    throw new Error("You cannot suspend your own account.");
  }

  await setAdminUserStatus(userId, "suspended");
  revalidatePath("/admin/users");
}

export async function restoreAdminUser(userId: string) {
  const session = await requirePermission("users");

  if (session.userId === userId) {
    throw new Error("You cannot restore your own account.");
  }

  await setAdminUserStatus(userId, "active");
  revalidatePath("/admin/users");
}

export async function changePreorderStatus(
  preorderId: string,
  status: PreorderStatus
) {
  await requirePermission("orders");

  if (!PREORDER_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  await updatePreorderStatus(preorderId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

export async function confirmPaymentAction(preorderId: string) {
  await requirePermission("payments");

  const preorder = await confirmPreorderPayment(preorderId);

  if (!preorder) {
    throw new Error("Order not found.");
  }

  try {
    const email = buildOrderInvoiceEmail(preorder);
    await sendAdminEmail({
      to: preorder.customerEmail,
      subject: email.subject,
      html: email.html,
    });
  } catch {
    // Payment is confirmed even if email fails.
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
}

export async function rejectPaymentAction(preorderId: string) {
  await requirePermission("payments");

  const preorder = await rejectPreorderPayment(preorderId);

  if (!preorder) {
    throw new Error("Order not found.");
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
}

function parseProductFormData(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const hoverImage = String(formData.get("hoverImage") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sizesRaw = String(formData.get("sizes") ?? "").trim();
  const homeSectionRaw = String(formData.get("homeSection") ?? "").trim();

  if (!name || !price || !image) {
    throw new Error("Name, price, and product image are required.");
  }

  if (
    !category ||
    !PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])
  ) {
    throw new Error("Select a valid category.");
  }

  const sizes = sizesRaw
    ? sizesRaw.split(",").map((size) => size.trim()).filter(Boolean)
    : [];

  const homeSection = homeSectionRaw ? Number(homeSectionRaw) : null;

  return {
    name,
    price,
    image,
    hoverImage: hoverImage || undefined,
    tag: tag || undefined,
    category,
    sizes,
    homeSection:
      homeSection === 1 || homeSection === 2 || homeSection === 3
        ? homeSection
        : null,
  };
}

function revalidateProductPaths() {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function addProduct(formData: FormData) {
  await requirePermission("products");
  await createProduct(parseProductFormData(formData));
  revalidateProductPaths();
}

export async function editProduct(formData: FormData) {
  await requirePermission("products");

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) {
    throw new Error("Product not found.");
  }

  await updateProduct(productId, parseProductFormData(formData));
  revalidateProductPaths();
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requirePermission("products");
  await setProductActive(productId, isActive);
  revalidateProductPaths();
}

export async function addDiscount(formData: FormData) {
  const session = await requirePermission("discounts");

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const value = Number(formData.get("value"));
  const scope = String(formData.get("scope") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const productIds = formData
    .getAll("productIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  if (!name) {
    throw new Error("Discount name is required.");
  }

  if (!DISCOUNT_TYPES.includes(type as DiscountType)) {
    throw new Error("Select a valid discount type.");
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Enter a valid discount value.");
  }

  if (type === "percent" && value > 100) {
    throw new Error("Percentage discounts cannot exceed 100.");
  }

  if (!DISCOUNT_SCOPES.includes(scope as DiscountScope)) {
    throw new Error("Select a valid discount scope.");
  }

  if (scope === "secret" && !code) {
    throw new Error("Secret discounts require a code.");
  }

  if (scope === "product" && productIds.length === 0) {
    throw new Error("Select at least one product for a product discount.");
  }

  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null;
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;

  if (startsAtRaw && (!startsAt || Number.isNaN(startsAt.getTime()))) {
    throw new Error("Enter a valid start date and time.");
  }

  if (endsAtRaw && (!endsAt || Number.isNaN(endsAt.getTime()))) {
    throw new Error("Enter a valid end date and time.");
  }

  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new Error("End date must be after the start date.");
  }

  await createDiscount({
    name,
    type: type as DiscountType,
    value,
    scope: scope as DiscountScope,
    code: scope === "secret" ? code : undefined,
    productIds,
    isActive,
    startsAt,
    endsAt,
    maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
    createdBy: session.userId,
  });

  revalidateDiscountPages();
}

function revalidateDiscountPages() {
  revalidatePath("/admin/discounts");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function toggleDiscountActive(discountId: string, isActive: boolean) {
  await requirePermission("discounts");
  await setDiscountActive(discountId, isActive);
  revalidateDiscountPages();
}

export async function suspendDiscountAction(discountId: string) {
  await requirePermission("discounts");
  await suspendDiscount(discountId);
  revalidateDiscountPages();
}

export async function reactivateDiscountAction(discountId: string) {
  await requirePermission("discounts");
  await reactivateDiscount(discountId);
  revalidateDiscountPages();
}

export async function cancelDiscountAction(discountId: string) {
  await requirePermission("discounts");
  await cancelDiscountNow(discountId);
  revalidateDiscountPages();
}
