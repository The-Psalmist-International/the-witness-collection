"use client";

import { createContext, useContext } from "react";
import type { ToastInput } from "@/app/components/toast/types";

export type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const noopToastContext: ToastContextValue = {
  toast: () => "",
  dismiss: () => {},
};

export const ToastContext = createContext<ToastContextValue>(noopToastContext);

export function useToast() {
  return useContext(ToastContext);
}
