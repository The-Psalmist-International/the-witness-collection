import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerRegisterForm } from "@/app/components/CustomerRegisterForm";
import { PromoBanner, HeaderContent } from "@/app/components/Navbar";
import { verifyCustomerSession } from "@/app/lib/customer/auth";

type RegisterPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function CustomerRegisterPage({
  searchParams,
}: RegisterPageProps) {
  const session = await verifyCustomerSession();
  const params = await searchParams;
  const redirectTo = params.redirect?.trim() || "/shop";

  if (session.isAuthenticated) {
    redirect(redirectTo);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-50 border-b border-neutral-100 bg-white">
        <PromoBanner />
        <div className="flex items-center justify-between px-6 py-4 md:px-12">
          <HeaderContent />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
        <h1 className="text-3xl font-medium tracking-tight">Create account</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Create an account with your name, email, phone, and password to
          checkout.
        </p>

        <div className="mt-10">
          <CustomerRegisterForm redirectTo={redirectTo} />
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          <Link href="/shop" className="font-medium text-purple-950">
            Continue shopping
          </Link>
        </p>
      </div>
    </main>
  );
}
