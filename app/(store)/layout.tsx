import { CartProvider } from "@/app/components/CartProvider";
import { CustomerSessionProvider } from "@/app/components/CustomerSessionProvider";
import { DiscountProvider } from "@/app/components/DiscountProvider";
import { LenisProvider } from "@/app/components/LenisProvider";
import { listActiveDiscounts } from "@/app/lib/discounts/data";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let discounts: Awaited<ReturnType<typeof listActiveDiscounts>> = [];

  try {
    discounts = await listActiveDiscounts();
  } catch {
    discounts = [];
  }

  return (
    <CustomerSessionProvider>
      <DiscountProvider discounts={discounts}>
        <CartProvider>
          <LenisProvider>{children}</LenisProvider>
        </CartProvider>
      </DiscountProvider>
    </CustomerSessionProvider>
  );
}
