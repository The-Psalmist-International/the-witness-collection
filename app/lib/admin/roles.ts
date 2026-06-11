export const ADMIN_ROLES = ["admin", "store_manager", "general_team"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  "dashboard",
  "orders",
  "payments",
  "products",
  "discounts",
  "users",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  admin: ["dashboard", "orders", "payments", "products", "discounts", "users"],
  store_manager: ["orders", "payments", "products"],
  general_team: ["products"],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Admin",
  store_manager: "Store manager",
  general_team: "General team",
};

export function isAdminRole(value: string): value is AdminRole {
  return ADMIN_ROLES.includes(value as AdminRole);
}

export function hasPermission(role: AdminRole, permission: AdminPermission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getDefaultAdminPath(role: AdminRole) {
  if (hasPermission(role, "dashboard")) {
    return "/admin";
  }

  if (hasPermission(role, "orders")) {
    return "/admin/orders";
  }

  if (hasPermission(role, "payments")) {
    return "/admin/payments";
  }

  return "/admin/products";
}
