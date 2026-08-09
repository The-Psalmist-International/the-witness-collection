import { getBachsConfig } from "./config";
import type {
  BachsCheckoutSession,
  BachsCustomer,
  BachsPayment,
  BachsProduct,
  CreateCheckoutSessionParams,
  CreateCustomerParams,
  CreateProductParams,
} from "./types";

class BachsApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "BachsApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { secretKey, baseUrl } = getBachsConfig();

  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorBody: { detail?: string; error_code?: string } | null = null;
    try {
      errorBody = await response.json();
    } catch {
      // ignore parse error
    }

    throw new BachsApiError(
      errorBody?.detail ?? `Bachs API error (${response.status})`,
      response.status,
      errorBody?.error_code,
      errorBody
    );
  }

  return response.json() as Promise<T>;
}

export function createCustomer(params: CreateCustomerParams): Promise<BachsCustomer> {
  return request<BachsCustomer>("/v1/customers", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function retrieveCustomer(id: string): Promise<BachsCustomer> {
  return request<BachsCustomer>(`/v1/customers/${id}`);
}

export function createProduct(
  params: CreateProductParams
): Promise<BachsProduct> {
  return request<BachsProduct>("/v1/products", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<BachsCheckoutSession> {
  return request<BachsCheckoutSession>("/v1/checkout-sessions", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function retrieveCheckoutSession(
  id: string
): Promise<BachsCheckoutSession> {
  return request<BachsCheckoutSession>(`/v1/checkout-sessions/${id}`);
}

export function retrievePayment(chargeId: string): Promise<BachsPayment> {
  return request<BachsPayment>(`/v1/payments/${chargeId}`);
}

export { BachsApiError };
