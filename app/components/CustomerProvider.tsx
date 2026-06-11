"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { CustomerSessionUser } from "@/app/lib/customer/types";

type CustomerContextValue = {
  customer: CustomerSessionUser | null;
  isAuthenticated: boolean;
  fullName: string;
  billingAddress: string | null;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({
  initialCustomer,
  children,
}: {
  initialCustomer: CustomerSessionUser | null;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      customer: initialCustomer,
      isAuthenticated: Boolean(initialCustomer),
      fullName: initialCustomer
        ? `${initialCustomer.firstName} ${initialCustomer.lastName}`.trim()
        : "",
      billingAddress: initialCustomer?.billingAddress ?? null,
    }),
    [initialCustomer]
  );

  return (
    <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error("useCustomer must be used within CustomerProvider");
  }

  return context;
}
