import { ShopPageClient } from "@/app/shop/ShopPageClient";
import { listActiveProducts } from "@/app/lib/products/data";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await listActiveProducts();
  return <ShopPageClient products={products} />;
}
