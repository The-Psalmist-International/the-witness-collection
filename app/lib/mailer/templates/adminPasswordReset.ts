import { wrapEmailHtml } from "@/app/lib/mailer/html-wrap";

type AdminPasswordResetEmailInput = {
  resetUrl: string;
};

export function buildAdminPasswordResetEmail({
  resetUrl,
}: AdminPasswordResetEmailInput) {
  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#111111;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b7280;">
      We received a request to reset your admin password. Use the button below to choose a new password. This link expires in 1 hour.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
      <tr>
        <td style="border-radius:999px;background:#3b0764;">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
            Reset password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
      If you did not request this, you can safely ignore this email.
    </p>
  `);

  return {
    subject: "Reset your Witness Collection admin password",
    html,
  };
}
