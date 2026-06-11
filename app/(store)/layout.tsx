import { CartProvider } from "@/app/components/CartProvider";
import { CustomerSessionProvider } from "@/app/components/CustomerSessionProvider";
import { LenisProvider } from "@/app/components/LenisProvider";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomerSessionProvider>
      <CartProvider>
        <LenisProvider>{children}</LenisProvider>
      </CartProvider>
    </CustomerSessionProvider>
  );
}
