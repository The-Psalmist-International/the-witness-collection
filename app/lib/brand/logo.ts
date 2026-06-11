export const BRAND_NAME = "The Witness Collection";

export const BRAND_LOGO_PATH = "/THC LOGOa copy.jpg";

export const BRAND_LOGO_ALT = "The Witness Collection logo";

export function getBrandLogoUrl(appUrl: string) {
  return `${appUrl.replace(/\/$/, "")}${encodeURI(BRAND_LOGO_PATH)}`;
}
