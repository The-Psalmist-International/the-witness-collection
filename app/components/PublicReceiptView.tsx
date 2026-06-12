"use client";

import { useEffect } from "react";
import type { Preorder } from "@/app/lib/db/schema";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";
import { formatOrderReference } from "@/app/lib/payments/reference";

type PublicReceiptViewProps = {
  preorder: Preorder;
  autoDownload?: boolean;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(date);
}

export function PublicReceiptView({
  preorder,
  autoDownload = false,
}: PublicReceiptViewProps) {
  useEffect(() => {
    if (autoDownload) {
      // Small delay to ensure fonts and images have loaded
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  const issuedAt = preorder.invoiceIssuedAt ?? new Date();
  const orderRef = formatOrderReference(preorder.orderReference, preorder.id);

  return (
    <>
      {/* Print & page styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          background: #f4f4f0;
          font-family: 'Stack Sans Headline', Arial, Helvetica, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }

        .receipt-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 40px 16px 80px;
          background: #f4f4f0;
        }

        .receipt-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          width: 100%;
          max-width: 760px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          background: #3b0764;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Stack Sans Headline', Arial, Helvetica, sans-serif;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-primary:hover { background: #4c0a80; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Stack Sans Headline', Arial, Helvetica, sans-serif;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-secondary:hover { background: #f9f9f9; }

        /* The paper card */
        .receipt-paper {
          width: 100%;
          max-width: 760px;
          background: #ffffff;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.10);
        }

        /* Header banner with image */
        .receipt-header {
          position: relative;
          background-color: #3b0764;
          background-image: url('/holy-communion-concept-with-bible.jpg');
          background-size: cover;
          background-position: center 30%;
          padding: 40px 40px 36px;
        }

        .receipt-header-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30, 0, 60, 0.82);
        }

        .receipt-header-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .receipt-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .receipt-logo {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.25);
        }

        .receipt-brand-name {
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .receipt-invoice-label {
          text-align: right;
        }

        .receipt-invoice-label p {
          margin: 0;
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .receipt-invoice-number {
          margin: 4px 0 0;
          color: #ffffff;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        /* Body */
        .receipt-body {
          padding: 36px 40px 40px;
        }

        /* Meta row: ref / date / status */
        .receipt-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 28px;
          border-bottom: 1.5px solid #f0f0ee;
          margin-bottom: 28px;
        }

        .receipt-meta-item label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 5px;
        }

        .receipt-meta-item p {
          margin: 0;
          font-size: 14px;
          color: #111111;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px 3px 7px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: #f3e8ff;
          color: #5b21b6;
        }

        .status-badge::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7c3aed;
        }

        /* Two column info */
        .receipt-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .receipt-info-box {
          border: 1px solid #f0f0ee;
          border-radius: 10px;
          padding: 16px 18px;
          background: #fafafa;
        }

        .receipt-info-box label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 8px;
        }

        .receipt-info-box p {
          margin: 0 0 3px;
          font-size: 14px;
          color: #111111;
        }

        .receipt-info-box p.name {
          font-weight: 600;
          font-size: 15px;
        }

        .receipt-info-box p.sub {
          color: #6b7280;
          font-size: 13px;
        }

        /* Items table */
        .receipt-table-wrap {
          margin-bottom: 20px;
          border: 1px solid #f0f0ee;
          border-radius: 10px;
          overflow: hidden;
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .receipt-table thead tr {
          background: #fafafa;
          border-bottom: 1px solid #f0f0ee;
        }

        .receipt-table th {
          padding: 11px 16px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af;
          text-align: left;
        }

        .receipt-table th:last-child { text-align: right; }

        .receipt-table td {
          padding: 13px 16px;
          color: #111111;
          border-bottom: 1px solid #f8f8f7;
          vertical-align: middle;
        }

        .receipt-table tbody tr:last-child td { border-bottom: none; }

        .receipt-table td:last-child { text-align: right; font-weight: 500; }

        .receipt-table td.item-name { font-weight: 500; }

        .receipt-table td.item-sub { color: #6b7280; }

        /* Totals */
        .receipt-totals {
          border-top: 1.5px solid #f0f0ee;
          padding-top: 16px;
          margin-top: 4px;
        }

        .receipt-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .receipt-total-row.grand {
          padding-top: 10px;
          margin-top: 6px;
          border-top: 1px solid #f0f0ee;
          font-size: 16px;
          font-weight: 700;
          color: #111111;
        }

        .receipt-total-row.grand .amount { color: #3b0764; }

        .receipt-total-row.discount { color: #7c3aed; }

        /* Footer */
        .receipt-footer {
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1.5px dashed #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .receipt-footer p {
          margin: 0;
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.5;
        }

        .receipt-footer strong { color: #6b7280; }

        /* Watermark strip */
        .receipt-stamp {
          display: inline-block;
          border: 2px solid #3b0764;
          color: #3b0764;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 4px;
          opacity: 0.7;
          white-space: nowrap;
        }

        /* ---- PRINT STYLES ---- */
        @media print {
          html, body {
            background: #ffffff !important;
          }

          .receipt-page {
            min-height: auto;
            background: #ffffff !important;
            padding: 0;
          }

          .receipt-actions { display: none !important; }

          .receipt-paper {
            max-width: 100%;
            box-shadow: none;
            border-radius: 0;
          }

          .receipt-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            margin: 0;
            size: A4;
          }
        }

        @media (max-width: 600px) {
          .receipt-header { padding: 28px 20px 24px; }
          .receipt-header-content { flex-direction: column; align-items: flex-start; gap: 16px; }
          .receipt-invoice-label { text-align: left; }
          .receipt-body { padding: 24px 20px 32px; }
          .receipt-info-grid { grid-template-columns: 1fr; }
          .receipt-actions { flex-direction: column; }
          .btn-primary, .btn-secondary { justify-content: center; }
        }
      `}</style>

      <div className="receipt-page">
        {/* Action buttons (hidden on print) */}
        <div className="receipt-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.print()}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save as PDF
          </button>
          <a href="/account/orders" className="btn-secondary">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to orders
          </a>
        </div>

        {/* The actual paper invoice */}
        <div className="receipt-paper">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-header-overlay" />
            <div className="receipt-header-content">
              <div className="receipt-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/THC LOGOa copy.jpg"
                  alt="The Witness Collection logo"
                  className="receipt-logo"
                />
                <span className="receipt-brand-name">The Witness Collection</span>
              </div>
              <div className="receipt-invoice-label">
                <p>Invoice</p>
                <p className="receipt-invoice-number">
                  {preorder.invoiceNumber ?? "Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="receipt-body">
            {/* Meta row */}
            <div className="receipt-meta">
              <div className="receipt-meta-item">
                <label>Order Reference</label>
                <p>{orderRef}</p>
              </div>
              <div className="receipt-meta-item">
                <label>Date Issued</label>
                <p>{formatDate(issuedAt)}</p>
              </div>
              <div className="receipt-meta-item">
                <label>Payment Status</label>
                <p>
                  <span className="status-badge">
                    {getPaymentStatusLabel(preorder.paymentStatus)}
                  </span>
                </p>
              </div>
            </div>

            {/* Bill to / Fulfillment */}
            <div className="receipt-info-grid">
              <div className="receipt-info-box">
                <label>Bill to</label>
                <p className="name">{preorder.customerName}</p>
                <p className="sub">{preorder.customerEmail}</p>
                <p className="sub">{preorder.customerPhone}</p>
              </div>
              <div className="receipt-info-box">
                <label>Fulfillment</label>
                <p className="name" style={{ textTransform: "capitalize" }}>
                  {preorder.fulfillmentType}
                </p>
                {preorder.fulfillmentType === "delivery" &&
                preorder.customerLocation ? (
                  <p className="sub">{preorder.customerLocation}</p>
                ) : null}
                {preorder.customerNotes ? (
                  <p className="sub" style={{ marginTop: 6 }}>
                    Note: {preorder.customerNotes}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Items */}
            <div className="receipt-table-wrap">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {preorder.items.map((item) => (
                    <tr key={`${preorder.id}-${item.productId}-${item.selectedSize}`}>
                      <td className="item-name">{item.name}</td>
                      <td className="item-sub">{item.selectedSize}</td>
                      <td className="item-sub">{item.quantity ?? 1}</td>
                      <td>{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="receipt-totals">
              {preorder.subtotalLabel ? (
                <div className="receipt-total-row">
                  <span>Subtotal</span>
                  <span>{preorder.subtotalLabel}</span>
                </div>
              ) : null}
              {preorder.discountLabel ? (
                <div className="receipt-total-row discount">
                  <span>Discount applied</span>
                  <span>{preorder.discountLabel}</span>
                </div>
              ) : null}
              <div className="receipt-total-row grand">
                <span>Total</span>
                <span className="amount">{preorder.totalLabel}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="receipt-footer">
              <p>
                Thank you for your order. <br />
                <strong>The Witness Collection</strong> — Questions? Contact us at{" "}
                <strong>thewitnesscollection@gmail.com</strong>
              </p>
              <div className="receipt-stamp">Paid</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
