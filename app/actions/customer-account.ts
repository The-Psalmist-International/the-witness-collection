"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validatePasswordStrength } from "@/app/lib/admin/password";
import {
  createCustomerSession,
  requireCustomerSession,
} from "@/app/lib/customer/auth";
import {
  updateCustomerBillingAddress,
  updateCustomerPassword,
  updateCustomerProfile,
  verifyCustomerPassword,
} from "@/app/lib/customer/users/data";

export type CustomerAccountState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateProfile(
  _previousState: CustomerAccountState,
  formData: FormData
): Promise<CustomerAccountState> {
  const session = await requireCustomerSession();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!firstName || !lastName || !phone) {
    return {
      status: "error",
      message: "First name, last name, and phone are required.",
    };
  }

  const user = await updateCustomerProfile(session.userId, {
    firstName,
    lastName,
    phone,
  });

  if (!user) {
    return { status: "error", message: "Could not update your profile." };
  }

  await createCustomerSession({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    billingAddress: user.billingAddress,
  });

  revalidatePath("/account/settings/profile");
  revalidatePath("/account/settings/billing");
  revalidatePath("/account/settings/security");
  revalidatePath("/account/orders");

  return { status: "success", message: "Profile updated." };
}

export async function updateBillingAddress(
  _previousState: CustomerAccountState,
  formData: FormData
): Promise<CustomerAccountState> {
  const session = await requireCustomerSession();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();

  if (!billingAddress) {
    return { status: "error", message: "Enter your billing address." };
  }

  const user = await updateCustomerBillingAddress(
    session.userId,
    billingAddress
  );

  if (!user) {
    return { status: "error", message: "Could not update billing address." };
  }

  await createCustomerSession({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    billingAddress: user.billingAddress,
  });

  revalidatePath("/account/settings/billing");
  revalidatePath("/shop");

  return { status: "success", message: "Billing address saved." };
}

export async function changeCustomerPassword(
  _previousState: CustomerAccountState,
  formData: FormData
): Promise<CustomerAccountState> {
  const session = await requireCustomerSession();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const isValidCurrent = await verifyCustomerPassword(
    session.userId,
    currentPassword
  );

  if (!isValidCurrent) {
    return { status: "error", message: "Current password is incorrect." };
  }

  const passwordError = validatePasswordStrength(password);

  if (passwordError) {
    return { status: "error", message: passwordError };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  await updateCustomerPassword(session.userId, password);
  revalidatePath("/account/settings/security");

  return { status: "success", message: "Password updated." };
}

export async function logoutCustomer() {
  const { clearCustomerSession } = await import("@/app/lib/customer/auth");
  await clearCustomerSession();
  redirect("/shop");
}
