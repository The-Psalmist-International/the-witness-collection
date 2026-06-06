export type ToastVariant = "success" | "error" | "warning";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};
