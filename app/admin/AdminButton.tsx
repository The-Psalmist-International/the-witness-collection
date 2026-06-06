import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminButtonVariant = "primary" | "secondary" | "ghost" | "icon";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: AdminButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<AdminButtonVariant, string> = {
  primary:
    "bg-purple-950 text-white hover:bg-purple-900 active:bg-purple-800 disabled:bg-purple-300",
  secondary:
    "border border-purple-950 text-purple-950 hover:bg-purple-50 active:bg-purple-100 disabled:border-purple-200 disabled:text-purple-200",
  ghost:
    "border border-neutral-200 text-black hover:border-purple-950 hover:text-purple-950 active:border-purple-800 active:text-purple-800",
  icon:
    "border border-neutral-200 text-neutral-600 hover:border-purple-950 hover:text-purple-950 active:border-purple-800 active:text-purple-800",
};

export function AdminButton({
  icon,
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: AdminButtonProps) {
  const isIconOnly = variant === "icon";

  return (
    <button
      type="button"
      className={`pressable inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
        isIconOnly ? "h-9 w-9" : "h-11 px-6"
      } ${fullWidth ? "w-full" : ""} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
