export type BachsMoney = {
  amount: string;
  currency: string;
};

export type BachsCustomer = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type BachsProductLineItem = {
  product_id: string;
  name: string;
  price: BachsMoney;
  quantity: number;
};

export type BachsCheckoutSession = {
  checkout_id: string;
  checkout_url: string;
  status: "OPEN" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expires_at: string;
  created_at: string;
  reference?: string;
};

export type BachsPayment = {
  id: string;
  status: "succeeded" | "failed" | "pending";
  amount: BachsMoney;
  fee: BachsMoney;
  net: BachsMoney;
  customer_id?: string;
  charge_id: string;
  payment_method: string;
  payment_rail: string;
  products: { product_id: string; name: string; price: BachsMoney }[];
  refunds: BachsRefund[];
  status_history: { status: string; timestamp: string }[];
  created_at: string;
  updated_at: string;
};

export type BachsSubscription = {
  id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  customer_id: string;
  product_id: string;
  price: BachsMoney;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
};

export type BachsRefund = {
  id: string;
  charge_id: string;
  payment_id: string;
  amount: BachsMoney;
  status: "succeeded" | "failed" | "pending";
  reason?: string;
  created_at: string;
  updated_at: string;
};

export type CreateCheckoutSessionParams = {
  customer: { customer_id: string } | { email: string; name: string; phone_number?: string };
  product_cart: { product_id: string; quantity?: number; amount?: string }[];
  billing_currency?: string;
  allowed_payment_method_types?: ("card" | "crypto" | "bank_transfer" | "mobile_money")[];
  cancel_url?: string;
  success_url?: string;
  metadata?: Record<string, string>;
  reference?: string;
  expires_in_minutes?: number;
};

export type BachsProduct = {
  id: string;
  name: string;
  price: {
    currency: string;
    amount: string;
    price_type: "fixed" | "free" | "custom";
  };
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type CreateCustomerParams = {
  email: string;
  name?: string;
  phone?: string;
};

export type CreateProductParams = {
  name: string;
  price: {
    currency: string;
    amount: string;
  };
  metadata?: Record<string, string>;
};

export type BachsWebhookEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
};
