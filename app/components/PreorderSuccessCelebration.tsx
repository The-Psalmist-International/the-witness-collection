"use client";

import confetti from "canvas-confetti";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

type PreorderSuccessCelebrationProps = {
  message: string;
  orderReference?: string;
  totalLabel?: string;
  customerName?: string;
  createdAt?: string;
  onClose: () => void;
};

const CONFETTI_COLORS = ["#3b0764", "#7e22ce", "#fbbf24", "#22c55e", "#ffffff"];

function fireConfettiBurst() {
  const duration = 2800;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 },
      colors: CONFETTI_COLORS,
      zIndex: 300,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 },
      colors: CONFETTI_COLORS,
      zIndex: 300,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 180,
    spread: 120,
    startVelocity: 42,
    origin: { y: 0.55 },
    colors: CONFETTI_COLORS,
    zIndex: 300,
  });

  confetti({
    particleCount: 80,
    spread: 100,
    origin: { x: 0.5, y: 0.2 },
    colors: CONFETTI_COLORS,
    zIndex: 300,
  });

  frame();
}

export function PreorderSuccessCelebration({
  message,
  orderReference,
  totalLabel,
  customerName,
  createdAt,
  onClose,
}: PreorderSuccessCelebrationProps) {
  const lenis = useLenis();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    fireConfettiBurst();

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [lenis]);

  const dateString = createdAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(createdAt))
    : "—";

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="preorder-success-title"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Top Section */}
        <div className="px-8 pb-8 pt-12 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2
            id="preorder-success-title"
            className="text-2xl font-bold tracking-tight text-black"
          >
            Thank you!
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {message}
          </p>
        </div>

        {/* Divider with Notches */}
        <div className="relative flex items-center justify-between">
          <div className="h-6 w-6 -translate-x-3 rounded-full bg-neutral-900/40 mix-blend-overlay absolute left-0" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}></div>
          <div className="w-full border-t-2 border-dashed border-neutral-200 mx-6"></div>
          <div className="h-6 w-6 translate-x-3 rounded-full bg-neutral-900/40 mix-blend-overlay absolute right-0" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}></div>
        </div>

        {/* Details Section */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-2 gap-y-6 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">Order ID</p>
              <p className="mt-1 font-semibold text-black">{orderReference || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">Amount</p>
              <p className="mt-1 font-semibold text-black">{totalLabel || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">Date & Time</p>
              <p className="mt-1 font-semibold text-black">{dateString}</p>
            </div>
          </div>

          {customerName && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <p className="font-medium text-black">{customerName}</p>
                <p className="text-xs text-neutral-500">Customer</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Barcode Section */}
        <div className="border-t-2 border-dashed border-neutral-200 px-8 py-6 text-center">
          <svg className="mx-auto h-12 w-full max-w-[240px] text-black" viewBox="0 0 100 40" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,0 h2 v40 h-2 z M4,0 h1 v40 h-1 z M7,0 h3 v40 h-3 z M12,0 h1 v40 h-1 z M15,0 h4 v40 h-4 z M21,0 h2 v40 h-2 z M25,0 h1 v40 h-1 z M28,0 h3 v40 h-3 z M33,0 h2 v40 h-2 z M37,0 h1 v40 h-1 z M40,0 h4 v40 h-4 z M46,0 h2 v40 h-2 z M50,0 h3 v40 h-3 z M55,0 h1 v40 h-1 z M58,0 h4 v40 h-4 z M64,0 h2 v40 h-2 z M68,0 h1 v40 h-1 z M71,0 h3 v40 h-3 z M76,0 h2 v40 h-2 z M80,0 h4 v40 h-4 z M86,0 h1 v40 h-1 z M89,0 h3 v40 h-3 z M94,0 h2 v40 h-2 z M98,0 h2 v40 h-2 z" />
          </svg>
          <button
            type="button"
            onClick={onClose}
            className="pressable mt-6 flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
