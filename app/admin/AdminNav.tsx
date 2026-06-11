"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  hasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/app/lib/admin/roles";

const NAV_ITEMS: {
  href: string;
  label: string;
  permission: AdminPermission;
  exact: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", permission: "dashboard", exact: true },
  { href: "/admin/orders", label: "Orders", permission: "orders", exact: false },
  {
    href: "/admin/products",
    label: "Products",
    permission: "products",
    exact: false,
  },
  {
    href: "/admin/discounts",
    label: "Discounts",
    permission: "discounts",
    exact: false,
  },
  { href: "/admin/users", label: "Users", permission: "users", exact: false },
];

type AdminNavProps = {
  role: AdminRole;
};

export function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(role, item.permission)
  );

  return (
    <nav className="border-t border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 md:px-10 lg:px-12">
        {visibleItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-purple-950 text-black"
                  : "border-transparent text-neutral-500 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
