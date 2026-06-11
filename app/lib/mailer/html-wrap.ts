import { getAppUrl } from "@/app/lib/mailer/app-url";
import { BRAND_NAME, getBrandLogoUrl } from "@/app/lib/brand/logo";

export function wrapEmailHtml(content: string) {
  const logoUrl = getBrandLogoUrl(getAppUrl());

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${BRAND_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(17,17,17,0.08);">
            <tr>
              <td style="background:#3b0764;padding:28px 32px;text-align:center;">
                <img src="${logoUrl}" alt="${BRAND_NAME} logo" width="44" height="44" style="display:inline-block;width:44px;height:44px;border-radius:12px;object-fit:cover;" />
                <p style="margin:16px 0 0;color:#ffffff;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">${BRAND_NAME}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                This message was sent by the ${BRAND_NAME} admin platform.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
