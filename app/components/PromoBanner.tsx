"use client";

import { useEffect, useState } from "react";
import {
  formatCountdown,
  formatDiscountBannerValue,
  getActiveGeneralDiscount,
  isDiscountLive,
} from "@/app/lib/discounts/display";
import { useDiscounts } from "@/app/components/DiscountProvider";

export function PromoBanner() {
  const { discounts } = useDiscounts();
  const generalDiscount = getActiveGeneralDiscount(discounts);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!generalDiscount?.endsAt) {
      setCountdown("");
      return;
    }

    const updateCountdown = () => {
      setCountdown(formatCountdown(generalDiscount.endsAt!));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [generalDiscount?.endsAt]);

  const message = generalDiscount
    ? `${generalDiscount.name} — ${formatDiscountBannerValue(generalDiscount)} storewide${
        generalDiscount.endsAt && isDiscountLive(generalDiscount)
          ? ` · Ends in ${countdown}`
          : ""
      }`
    : "All items are currently on pre-order.";

  return (
    <div className="relative w-full overflow-hidden bg-[#3b0764] py-3 px-4 text-center text-xs font-medium tracking-wide text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay">
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <filter id="noiseFilterBanner">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterBanner)" />
        </svg>
      </div>
      <span className="relative z-10 text-sm font-normal">{message}</span>
    </div>
  );
}
