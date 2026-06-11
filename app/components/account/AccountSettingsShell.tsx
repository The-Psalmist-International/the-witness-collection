"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutCustomer } from "@/app/actions/customer-account";
import { PromoBanner, HeaderContent } from "@/app/components/Navbar";

const PERSONAL_LINKS = [
  {
    href: "/account/settings/profile",
    label: "Personal information",
    description: "Name, email, and phone",
  },
  {
    href: "/account/settings/billing",
    label: "Billing address",
    description: "Default address for orders",
  },
  {
    href: "/account/settings/security",
    label: "Privacy & security",
    description: "Password and account access",
  },
  {
    href: "/account/orders",
    label: "My orders",
    description: "Track pre-order status",
  },
];

type AccountSettingsShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AccountSettingsShell({
  title,
  description,
  children,
}: AccountSettingsShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <div className="sticky top-0 z-50 border-b border-neutral-100 bg-white">
        <PromoBanner />
        <div className="flex items-center justify-between px-6 py-4 md:px-12">
          <HeaderContent />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:px-12 md:py-14">
        <aside className="w-full shrink-0 md:w-72">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Account
          </p>
          <nav className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {PERSONAL_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between border-b border-neutral-100 px-4 py-4 text-left transition-colors last:border-b-0 ${
                    isActive
                      ? "border-l-4 border-l-purple-950 bg-purple-50/60 pl-3"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium text-black">
                      {link.label}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {link.description}
                    </span>
                  </span>
                  <span className="text-neutral-400" aria-hidden="true">
                    ›
                  </span>
                </Link>
              );
            })}
          </nav>

          <form action={logoutCustomer} className="mt-4">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-black transition-colors hover:border-purple-950 hover:text-purple-950"
            >
              Sign out
            </button>
          </form>
        </aside>

        <section className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <div className="border-b border-neutral-100 pb-6">
            <h1 className="text-2xl font-medium tracking-tight text-black md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              {description}
            </p>
          </div>
          <div className="pt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
