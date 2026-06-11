"use server";

import { redirect } from "next/navigation";
import { validatePasswordStrength } from "@/app/lib/admin/password";
import {
  createCustomerSession,
  isCustomerAuthConfigured,
} from "@/app/lib/customer/auth";
import {
  type CustomerAuthState,
} from "@/app/lib/customer/types";
import {
  authenticateCustomerLogin,
  createCustomer,
  getCustomerByEmail,
} from "@/app/lib/customer/users/data";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerCustomer(
  _previousState: CustomerAuthState,
  formData: FormData
): Promise<CustomerAuthState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim() || "/shop";

  if (!isCustomerAuthConfigured()) {
    return {
      status: "error",
      message: "Customer accounts are not configured yet.",
    };
  }

  if (!firstName || !lastName || !email || !phone || !billingAddress) {
    return {
      status: "error",
      message:
        "Enter your first name, last name, email, phone number, and billing address.",
    };
  }

  if (!emailPattern.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const passwordError = validatePasswordStrength(password);

  if (passwordError) {
    return { status: "error", message: passwordError };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  const existing = await getCustomerByEmail(email);

  if (existing) {
    return {
      status: "error",
      message: "An account with this email already exists. Sign in instead.",
    };
  }

  const user = await createCustomer({
    email,
    firstName,
    lastName,
    phone,
    billingAddress,
    password,
  });

  if (!user) {
    return {
      status: "error",
      message: "We could not create your account. Try again.",
    };
  }

  await createCustomerSession({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    billingAddress: user.billingAddress,
  });

  redirect(redirectTo);
}

export async function loginCustomer(
  _previousState: CustomerAuthState,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim() || "/shop";

  if (!isCustomerAuthConfigured()) {
    return {
      status: "error",
      message: "Customer accounts are not configured yet.",
    };
  }

  const authResult = await authenticateCustomerLogin(email, password);

  if (!authResult.ok) {
    return {
      status: "error",
      message:
        authResult.reason === "suspended"
          ? "This account has been suspended."
          : "Invalid email or password.",
    };
  }

  const user = authResult.user;

  await createCustomerSession({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    billingAddress: user.billingAddress,
  });

  redirect(redirectTo);
}
