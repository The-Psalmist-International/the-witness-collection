import type { Preorder } from "@/app/lib/db/schema";
import { getAppUrl } from "@/app/lib/mailer/app-url";
import { wrapEmailHtml } from "@/app/lib/mailer/html-wrap";
import { getPaymentStatusLabel } from "@/app/lib/payments/constants";
import { formatOrderReference } from "@/app/lib/payments/reference";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInvoiceDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(date);
}

export function buildInvoiceHtml(preorder: Preorder) {
  const issuedAt = preorder.invoiceIssuedAt ?? new Date();
  const itemRows = preorder.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">${escapeHtml(item.name)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${escapeHtml(item.selectedSize)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity ?? 1}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;">${escapeHtml(item.price)}</td>
        </tr>`
    )
    .join("");

  const discountRow = preorder.discountLabel
    ? `<tr>
        <td colspan="3" style="padding:10px 0;text-align:right;color:#6b7280;">Discount</td>
        <td style="padding:10px 0;text-align:right;color:#3b0764;">${escapeHtml(preorder.discountLabel)}</td>
      </tr>`
    : "";

  return `
    <div style="max-width:720px;margin:0 auto;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
        <tr>
          <td valign="top" align="left">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">Invoice</p>
            <h1 style="margin:0;font-size:32px;font-weight:700;color:#111111;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${escapeHtml(preorder.invoiceNumber ?? "Pending")}</h1>
            <p style="margin:12px 0 0;font-size:15px;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">Order ref: ${escapeHtml(formatOrderReference(preorder.orderReference, preorder.id))}</p>
          </td>
          <td valign="bottom" align="right">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">Issued</p>
            <p style="margin:0;font-size:15px;color:#111111;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${formatInvoiceDate(issuedAt)}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
        <tr>
          <td valign="top" width="48%" style="padding:20px;border:1px solid #e5e7eb;border-radius:14px;background:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">Bill to</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#111111;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${escapeHtml(preorder.customerName)}</p>
            <p style="margin:6px 0 0;font-size:14px;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${escapeHtml(preorder.customerEmail)}</p>
            <p style="margin:6px 0 0;font-size:14px;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${escapeHtml(preorder.customerPhone)}</p>
          </td>
          <td width="4%"></td>
          <td valign="top" width="48%" style="padding:20px;border:1px solid #e5e7eb;border-radius:14px;background:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">Fulfillment</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#111111;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${escapeHtml(
              preorder.fulfillmentType === "pickup"
                ? "Pickup"
                : "Delivery"
            )}</p>
            ${
              preorder.fulfillmentType === "delivery" && preorder.customerLocation
                ? `<p style="margin:6px 0 0;font-size:14px;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${escapeHtml(preorder.customerLocation)}</p>`
                : ""
            }
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
        <thead>
          <tr>
            <th style="padding:0 0 12px;text-align:left;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Item</th>
            <th style="padding:0 0 12px;text-align:center;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Size</th>
            <th style="padding:0 0 12px;text-align:center;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Qty</th>
            <th style="padding:0 0 12px;text-align:right;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${
          preorder.subtotalLabel
            ? `<tr>
                <td colspan="3" style="padding:10px 0;text-align:right;color:#6b7280;">Subtotal</td>
                <td style="padding:10px 0;text-align:right;color:#111111;">${escapeHtml(preorder.subtotalLabel)}</td>
              </tr>`
            : ""
        }
        ${discountRow}
        <tr>
          <td colspan="3" style="padding:14px 0 0;text-align:right;font-size:16px;font-weight:700;color:#111111;">Total</td>
          <td style="padding:14px 0 0;text-align:right;font-size:16px;font-weight:700;color:#3b0764;">${escapeHtml(preorder.totalLabel)}</td>
        </tr>
      </table>

      <p style="margin:32px 0 0;font-size:13px;line-height:1.7;color:#6b7280;">
        Payment status: ${escapeHtml(getPaymentStatusLabel(preorder.paymentStatus))}
      </p>
    </div>
  `;
}

export function buildOrderInvoiceEmail(preorder: Preorder) {
  const invoiceUrl = `${getAppUrl()}/receipt/${preorder.id}?ref=${preorder.orderReference}`;
  const downloadUrl = `${getAppUrl()}/receipt/${preorder.id}?ref=${preorder.orderReference}&download=true`;
  const content = `
    <h1 style="margin:0 0 16px;font-size:32px;font-weight:700;line-height:1.2;color:#111111;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">Your invoice is ready</h1>
    <p style="margin:0 0 40px;font-size:16px;line-height:1.6;color:#6b7280;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">
      Hi ${escapeHtml(preorder.customerName)}, your payment for order
      <strong style="color:#3b0764;">${escapeHtml(formatOrderReference(preorder.orderReference, preorder.id))}</strong>
      has been confirmed. Your invoice <strong>${escapeHtml(preorder.invoiceNumber ?? "")}</strong> is attached below.
    </p>
    ${buildInvoiceHtml(preorder)}
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:32px auto 0;">
      <tr>
        <td style="border-radius:999px;background:#3b0764;">
          <a href="${invoiceUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">
            View invoice online
          </a>
        </td>
        <td width="16"></td>
        <td style="border-radius:999px;background:#f3f4f6;border:1px solid #e5e7eb;">
          <a href="${downloadUrl}" style="display:inline-block;padding:14px 28px;color:#111111;text-decoration:none;font-size:14px;font-weight:700;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">
            Download Receipt
          </a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `Invoice ${preorder.invoiceNumber} — ${formatOrderReference(preorder.orderReference, preorder.id)}`,
    html: wrapEmailHtml(content),
  };
}
