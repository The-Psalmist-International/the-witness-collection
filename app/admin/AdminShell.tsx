import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions/auth";
import { LogOutIcon } from "@/app/admin/AdminIcons";
import { AdminNav } from "@/app/admin/AdminNav";
import { BrandLogo } from "@/app/components/BrandLogo";
import type { AdminRole } from "@/app/lib/admin/roles";

type AdminShellProps = {
  email: string;
  role: AdminRole;
  children: React.ReactNode;
};

export function AdminShell({ email, role, children }: AdminShellProps) {
  return (
    <>
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 md:px-10 lg:px-12">
          <BrandLogo
            href="/"
            size="sm"
            wordmarkClassName="text-sm font-light tracking-tight text-black"
          />

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="hidden text-neutral-400 md:inline">{email}</span>
            <Link
              href="/shop"
              className="hidden transition-colors hover:text-black sm:inline"
            >
              Shop
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-purple-950 px-4 py-2 text-xs font-medium text-purple-950 transition-colors hover:bg-purple-50"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AdminNav role={role} />
      </header>

      <main className="min-h-[calc(100vh-73px)] bg-neutral-50 px-6 py-10 text-black md:px-10 md:py-14 lg:px-12">
        <section className="mx-auto flex max-w-7xl flex-col gap-8">
          {children}
        </section>
      </main>
    </>
  );
}
