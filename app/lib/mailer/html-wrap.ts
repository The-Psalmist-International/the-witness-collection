import { getAppUrl } from "@/app/lib/mailer/app-url";
import { BRAND_NAME, getBrandLogoUrl } from "@/app/lib/brand/logo";

export function wrapEmailHtml(content: string) {
  const logoUrl = getBrandLogoUrl(getAppUrl());

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap" rel="stylesheet">
    <title>${BRAND_NAME}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap');
      body, table, td, p, h1, h2, h3, a {
        font-family: 'Stack Sans Headline', Arial, Helvetica, sans-serif !important;
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(17,17,17,0.08);">
            <tr>
              <td background="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" bgcolor="#3b0764" valign="top" style="background-color:#3b0764; background-image:url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'); background-size:cover; background-position:center; text-align:center; padding:0;">
                <div style="background-color:rgba(59,7,100,0.85); padding:40px 32px;">
                  <img src="${logoUrl}" alt="${BRAND_NAME} logo" width="44" height="44" style="display:inline-block;width:44px;height:44px;border-radius:12px;object-fit:cover;" />
                  <p style="margin:16px 0 0;color:#ffffff;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;font-family:'Stack Sans Headline', Arial, Helvetica, sans-serif;">${BRAND_NAME}</p>
                </div>
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
