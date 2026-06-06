"use client";

import { useState, useTransition } from "react";
import { AddUserDrawer } from "@/app/admin/AddUserDrawer";
import { AdminButton } from "@/app/admin/AdminButton";
import {
  BanIcon,
  RestoreIcon,
  UserPlusIcon,
} from "@/app/admin/AdminIcons";
import {
  restoreAdminUser,
  suspendAdminUser,
} from "@/app/admin/actions";
import { PaginationBar } from "@/app/admin/PaginationBar";
import { ROLE_LABELS } from "@/app/lib/admin/roles";
import {
  getAdminUserDisplayName,
  type AdminUserRecord,
} from "@/app/lib/admin/users/data";

type AdminUsersPanelProps = {
  users: AdminUserRecord[];
  currentUserId: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

export function AdminUsersPanel({
  users,
  currentUserId,
  pagination,
}: AdminUsersPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          {pagination.totalItems}{" "}
          {pagination.totalItems === 1 ? "user" : "users"} with admin access
        </p>
        <AdminButton
          icon={<UserPlusIcon />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Add user
        </AdminButton>
      </div>

      <div className="relative overflow-hidden rounded-md border border-neutral-200 bg-white">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-black">No team members yet.</p>
            <p className="mt-2 text-sm text-neutral-500">
              Add your first admin, store manager, or general team member.
            </p>
            <AdminButton
              variant="secondary"
              className="mt-6"
              icon={<UserPlusIcon />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Add user
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Phone</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;

                  return (
                    <tr key={user.id}>
                      <td className="px-5 py-4 text-sm font-medium text-black">
                        {getAdminUserDisplayName(user)}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-neutral-400">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-600">
                        {user.email}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-600">
                        {user.phone || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-600">
                        {ROLE_LABELS[user.role]}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-50 text-green-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {user.status === "active" ? (
                            <AdminButton
                              variant="icon"
                              aria-label={`Suspend ${user.email}`}
                              disabled={pending || isSelf}
                              onClick={() =>
                                startTransition(async () => {
                                  await suspendAdminUser(user.id);
                                })
                              }
                              icon={<BanIcon />}
                            />
                          ) : (
                            <AdminButton
                              variant="icon"
                              aria-label={`Restore ${user.email}`}
                              disabled={pending || isSelf}
                              onClick={() =>
                                startTransition(async () => {
                                  await restoreAdminUser(user.id);
                                })
                              }
                              icon={<RestoreIcon />}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalItems > 0 && (
          <PaginationBar
            basePath="/admin/users"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
          />
        )}
      </div>

      <AddUserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
