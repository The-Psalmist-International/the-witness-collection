"use client";

import confetti from "canvas-confetti";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

type PreorderSuccessCelebrationProps = {
  message: string;
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

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-white/85 px-6 backdrop-blur-[2px]"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="preorder-success-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white px-8 py-10 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-950">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2
          id="preorder-success-title"
          className="text-2xl font-medium tracking-tight text-black"
        >
          Pre-order received
        </h2>
        <p className="mt-4 text-sm leading-7 text-neutral-600">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="pressable mt-8 flex h-11 w-full items-center justify-center rounded-full bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 active:bg-purple-800"
        >
          Continue shopping
        </button>
      </div>
    </div>
  );
}
