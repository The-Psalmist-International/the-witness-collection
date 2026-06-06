"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AddProductDrawer } from "@/app/admin/AddProductDrawer";
import { AdminButton } from "@/app/admin/AdminButton";
import { EditProductDrawer } from "@/app/admin/EditProductDrawer";
import { EyeIcon, PencilIcon, PlusIcon } from "@/app/admin/AdminIcons";
import { ProductDetailDrawer } from "@/app/admin/ProductDetailDrawer";
import { toggleProductActive } from "@/app/admin/actions";
import { PaginationBar } from "@/app/admin/PaginationBar";
import type { DbProduct } from "@/app/lib/products/types";

type AdminProductsPanelProps = {
  products: DbProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
};

export function AdminProductsPanel({
  products,
  pagination,
}: AdminProductsPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<DbProduct | null>(null);
  const [editProduct, setEditProduct] = useState<DbProduct | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          {pagination.totalItems}{" "}
          {pagination.totalItems === 1 ? "product" : "products"} in catalog
        </p>
        <AdminButton
          icon={<PlusIcon />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Add product
        </AdminButton>
      </div>

      <div className="relative overflow-hidden rounded-md border border-neutral-200 bg-white">
        {products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-black">No products yet.</p>
            <p className="mt-2 text-sm text-neutral-500">
              Add your first product to populate the shop and home pages.
            </p>
            <AdminButton
              variant="secondary"
              className="mt-6"
              icon={<PlusIcon />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Add product
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 overflow-hidden rounded-md bg-neutral-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-600">
                    {product.category || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-black">
                    {product.price}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await toggleProductActive(
                            product.id,
                            !product.isActive
                          );
                        })
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-50 text-green-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="icon"
                        aria-label={`View ${product.name}`}
                        onClick={() => setViewProduct(product)}
                        icon={<EyeIcon />}
                      />
                      <AdminButton
                        variant="icon"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => setEditProduct(product)}
                        icon={<PencilIcon />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {pagination.totalItems > 0 && (
          <PaginationBar
            basePath="/admin/products"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
          />
        )}
      </div>

      <AddProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <ProductDetailDrawer
        product={viewProduct}
        onClose={() => setViewProduct(null)}
      />

      <EditProductDrawer
        product={editProduct}
        onClose={() => setEditProduct(null)}
      />
    </>
  );
}
