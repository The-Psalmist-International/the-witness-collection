export const PRODUCT_CATEGORIES = [
  "Apparel",
  "Apothecary",
  "Books & Study Materials",
  "Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const APPAREL_SUBCATEGORIES = [
  "T-Shirt",
  "Hoodie",
  "Sweater",
  "Cap",
] as const;

export type ApparelSubcategory = (typeof APPAREL_SUBCATEGORIES)[number];

export const SHOP_FILTER_CATEGORIES = ["All", ...PRODUCT_CATEGORIES] as const;
