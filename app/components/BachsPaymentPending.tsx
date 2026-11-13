"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";

export function BachsPaymentPending({ status = "checkout_pending" }: { status?: string }) {
  const [seconds, setSeconds] = useState(10);
  const terminal = ["checkout_failed", "checkout_abandoned", "checkout_expired", "rejected"].includes(status);

  useEffect(() => {
    if (terminal) return;
    if (seconds <= 0) {
      window.location.reload();
      return;
    }

    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, terminal]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f4f0",
        padding: "40px 16px",
        fontFamily: "'Stack Sans Headline', Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          background: "#ffffff",
          borderRadius: 12,
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#f3e8ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#111" }}>
          {terminal ? getPaymentStatusLabel(status) : "Confirming payment"}
        </h1>

        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#6b7280",
          }}
        >
          {terminal ? "Payment has not been confirmed. View your orders for details." : <>We are waiting for payment confirmation. This page will refresh in <strong>{seconds}</strong> second{seconds !== 1 ? "s" : ""}.</>}
        </p>

        <div
          style={{
            marginTop: 28,
            width: "100%",
            height: 4,
            background: "#f0f0ee",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: terminal ? "0%" : `${((10 - seconds) / 10) * 100}%`,
              background: "#7c3aed",
              borderRadius: 2,
              transition: "width 1s linear",
            }}
          />
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link
            href="/account/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 999,
              background: "#ffffff",
              color: "#111",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid #e5e7eb",
              textDecoration: "none",
            }}
          >
            View my orders
          </Link>
        </div>
      </div>
    </div>
  );
}
