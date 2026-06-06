import { getAppUrl } from "@/app/lib/mailer/app-url";
import { wrapEmailHtml } from "@/app/lib/mailer/html-wrap";
import { ROLE_LABELS, type AdminRole } from "@/app/lib/admin/roles";

type AdminWelcomeEmailInput = {
  email: string;
  firstName: string;
  role: AdminRole;
  temporaryPassword: string;
};

export function buildAdminWelcomeEmail({
  email,
  firstName,
  role,
  temporaryPassword,
}: AdminWelcomeEmailInput) {
  const loginUrl = `${getAppUrl()}/admin`;

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#111111;">Welcome, ${firstName}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6b7280;">
      Your account has been created as <strong style="color:#3b0764;">${ROLE_LABELS[role]}</strong>.
      Use the temporary password below to sign in, then you will be asked to set a new password before accessing the dashboard.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#faf5ff;border:1px solid #ede9fe;border-radius:14px;">
      <tr>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Work email</p>
          <p style="margin:0 0 16px;font-size:15px;color:#111111;">${email}</p>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Temporary password</p>
          <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.04em;color:#3b0764;">${temporaryPassword}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
      <tr>
        <td style="border-radius:999px;background:#3b0764;">
          <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
            Continue to sign in
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
      Login URL: <a href="${loginUrl}" style="color:#3b0764;">${loginUrl}</a>
    </p>
  `);

  return {
    subject: "Your Witness Collection admin access",
    html,
  };
}
