import { HomePage } from "@/app/components/HomePage";
import { listHomeProductGroups } from "@/app/lib/products/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const productGroups = await listHomeProductGroups();
  return <HomePage productGroups={productGroups} />;
}
