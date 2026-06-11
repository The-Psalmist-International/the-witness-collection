"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminConfigured,
} from "@/app/lib/admin/auth";
import { validatePasswordStrength } from "@/app/lib/admin/password";
import { getDefaultAdminPath } from "@/app/lib/admin/roles";
import type { AdminFormState, AdminLoginState } from "@/app/lib/admin/types";
import { bootstrapAdminUser } from "@/app/lib/admin/users/seed";
import {
  authenticateAdminLogin,
  createPasswordResetToken,
  getAdminUserByEmail,
  markPasswordResetTokenUsed,
  updateAdminLastLogin,
  updateAdminUserPassword,
  validatePasswordResetToken,
} from "@/app/lib/admin/users/data";
import { getAppUrl } from "@/app/lib/mailer/app-url";
import { sendAdminEmail } from "@/app/lib/mailer/smtp";
import { buildAdminPasswordResetEmail } from "@/app/lib/mailer/templates/adminPasswordReset";

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

  try {
    await bootstrapAdminUser();
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Database is unavailable. Check DATABASE_URL and run npm run db:push.",
    };
  }

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
    const { verifyAdminSession } = await import("@/app/lib/admin/auth");
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
