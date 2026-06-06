import type { Product } from "@/app/components/ProductCard";

export type DbProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage: string | null;
  tag: string | null;
  sizes: string[];
  category: string | null;
  homeSection: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type NewProductInput = {
  name: string;
  price: string;
  image: string;
  hoverImage?: string;
  tag?: string;
  sizes?: string[];
  category?: string;
  homeSection?: number | null;
};

export function toProduct(record: DbProduct): Product {
  return {
    id: record.id,
    name: record.name,
    price: record.price,
    image: record.image,
    ...(record.hoverImage ? { hoverImage: record.hoverImage } : {}),
    ...(record.tag ? { tag: record.tag } : {}),
    ...(record.sizes.length > 0 ? { sizes: record.sizes } : {}),
    ...(record.category ? { category: record.category } : {}),
  };
}
