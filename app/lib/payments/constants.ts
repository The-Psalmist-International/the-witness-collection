export const PAYMENT_STATUSES = [
  "pending_confirmation",
  "confirmed",
  "rejected",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending_confirmation: "Pending payment confirmation",
  confirmed: "Payment confirmed",
  rejected: "Payment rejected",
};

export const ADMIN_PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending_confirmation: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
};

export function getPaymentStatusLabel(status: string) {
  return (
    PAYMENT_STATUS_LABELS[status as PaymentStatus] ??
    status.replace(/_/g, " ")
  );
}

export function getAdminPaymentStatusLabel(status: string) {
  return (
    ADMIN_PAYMENT_STATUS_LABELS[status as PaymentStatus] ??
    status.replace(/_/g, " ")
  );
}

export const PAYMENT_INSTRUCTIONS = [
  "Make your payment using the bank details below.",
  "Use your order reference as the payment description.",
  "Upload a screenshot or receipt as proof of payment.",
  "We will confirm your payment and email your invoice shortly.",
];

export const PAYMENT_BANK_DETAILS = {
  bankName: "Your Bank Name",
  accountName: "The Witness Collection",
  accountNumber: "0000000000",
  branch: "Main Branch",
};
