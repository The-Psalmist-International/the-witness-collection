"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AdminPaymentRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!["/admin", "/admin/orders", "/admin/payments"].includes(pathname)) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && !pending) {
        startTransition(() => router.refresh());
      }
    };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, pathname, pending]);

  return null;
}
