import { cookies } from "next/headers";
import { CustomerProvider } from "@/app/components/CustomerProvider";
import { verifyCustomerSession } from "@/app/lib/customer/auth";

const CUSTOMER_COOKIE = "twc_customer_session";

export async function CustomerSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasCustomerCookie = Boolean(
    (await cookies()).get(CUSTOMER_COOKIE)?.value
  );

  const session = hasCustomerCookie
    ? await verifyCustomerSession()
    : { isAuthenticated: false as const };

  return (
    <CustomerProvider
      initialCustomer={session.isAuthenticated ? session : null}
    >
      {children}
    </CustomerProvider>
  );
}
