import { ShopPageClient } from "@/app/(store)/shop/ShopPageClient";
import { listActiveProducts } from "@/app/lib/products/data";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [products, params] = await Promise.all([
    listActiveProducts(),
    searchParams,
  ]);
  const q = Array.isArray(params.q) ? params.q[0] : params.q;

  return <ShopPageClient products={products} initialQuery={q ?? ""} />;
}
