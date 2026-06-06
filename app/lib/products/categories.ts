export const PRODUCT_CATEGORIES = [
  "Apparel",
  "Apothecary",
  "Books & Study Materials",
  "Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const SHOP_FILTER_CATEGORIES = ["All", ...PRODUCT_CATEGORIES] as const;
