"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminConfigured,
  requireAdminSession,
  verifyAdminSession,
} from "@/app/lib/admin/auth";
import { bootstrapAdminUser } from "@/app/lib/admin/users/seed";
import { validatePasswordStrength } from "@/app/lib/admin/password";
import {
  getDefaultAdminPath,
  hasPermission,
  isAdminRole,
  type AdminPermission,
} from "@/app/lib/admin/roles";
import type { AdminFormState, AdminLoginState } from "@/app/lib/admin/types";
import {
  authenticateAdminLogin,
  createAdminUser,
  createPasswordResetToken,
  getAdminUserByEmail,
  markPasswordResetTokenUsed,
  setAdminUserStatus,
  updateAdminLastLogin,
  updateAdminUserPassword,
  validatePasswordResetToken,
} from "@/app/lib/admin/users/data";
import { getAppUrl } from "@/app/lib/mailer/app-url";
import { sendAdminEmail } from "@/app/lib/mailer/smtp";
import { buildAdminPasswordResetEmail } from "@/app/lib/mailer/templates/adminPasswordReset";
import { buildAdminWelcomeEmail } from "@/app/lib/mailer/templates/adminWelcome";
import {
  PREORDER_STATUSES,
  type PreorderStatus,
} from "@/app/lib/preorders/constants";
import { updatePreorderStatus } from "@/app/lib/preorders/data";
import { PRODUCT_CATEGORIES } from "@/app/lib/products/categories";
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

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isAdminConfigured()) {
    return {
      status: "error",
      message:
        "Admin access is not configured. Set ADMIN_SESSION_SECRET and DATABASE_URL.",
    };
  }

  await bootstrapAdminUser();

  const authResult = await authenticateAdminLogin(email, password);

  if (!authResult.ok) {
    return {
      status: "error",
      message:
        authResult.reason === "suspended"
          ? "This account has been suspended. Contact an administrator."
          : "Invalid email or password.",
    };
  }

  const user = authResult.user;

  await updateAdminLastLogin(user.id);

  await createAdminSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    mustResetPassword: user.mustResetPassword,
  });

  if (user.mustResetPassword) {
    redirect("/admin/reset-password");
  }

  redirect(getDefaultAdminPath(user.role));
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin");
}

export async function requestPasswordReset(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = email ? await getAdminUserByEmail(email) : null;

  if (user && user.status === "active") {
    try {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `${getAppUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`;
      const emailContent = buildAdminPasswordResetEmail({ resetUrl });

      await sendAdminEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch {
      // Always return generic success to avoid email enumeration.
    }
  }

  return {
    status: "success",
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function resetPassword(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const token = String(formData.get("token") ?? "").trim();
  const mode = String(formData.get("mode") ?? "token");

  const passwordError = validatePasswordStrength(password);

  if (passwordError) {
    return { status: "error", message: passwordError };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  let userId: string | null = null;

  if (mode === "mandatory") {
    const session = await verifyAdminSession();

    if (!session.isAuthenticated || !session.mustResetPassword) {
      return { status: "error", message: "Unauthorized reset request." };
    }

    userId = session.userId;
  } else if (token) {
    userId = await validatePasswordResetToken(token);

    if (!userId) {
      return { status: "error", message: "This reset link is invalid or expired." };
    }
  } else {
    return { status: "error", message: "Missing reset token." };
  }

  await updateAdminUserPassword(userId, password, { clearMustReset: true });

  if (token) {
    await markPasswordResetTokenUsed(token);
  }

  await clearAdminSession();
  redirect("/admin?reset=success");
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
