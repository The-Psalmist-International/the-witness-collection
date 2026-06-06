"use client";

import Image from "next/image";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import type { DbProduct } from "@/app/lib/products/types";

type ProductDetailDrawerProps = {
  product: DbProduct | null;
  onClose: () => void;
};

function homeSectionLabel(section: number | null) {
  if (!section) {
    return "Shop only";
  }

  return `Home section ${section}`;
}

function DetailCell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm text-black">{children}</dd>
    </div>
  );
}

export function ProductDetailDrawer({
  product,
  onClose,
}: ProductDetailDrawerProps) {
  if (!product) {
    return null;
  }

  return (
    <AdminDrawer
      isOpen={Boolean(product)}
      onClose={onClose}
      eyebrow="Product details"
      title={product.name}
      subtitle={product.id}
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Images
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="overflow-hidden rounded-md border border-neutral-100">
              <div className="relative aspect-[4/5] bg-neutral-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 512px) 100vw, 256px"
                  className="object-cover"
                />
              </div>
              <p className="px-3 py-2 text-xs text-neutral-500">Product image</p>
            </div>
            {product.hoverImage ? (
              <div className="overflow-hidden rounded-md border border-neutral-100">
                <div className="relative aspect-[4/5] bg-neutral-100">
                  <Image
                    src={product.hoverImage}
                    alt={`${product.name} hover`}
                    fill
                    sizes="(max-width: 512px) 100vw, 256px"
                    className="object-cover"
                  />
                </div>
                <p className="px-3 py-2 text-xs text-neutral-500">Hover image</p>
              </div>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
                No hover image
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Details
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 rounded-md border border-neutral-200 p-4 sm:grid-cols-3">
            <DetailCell label="Price">
              <span className="font-medium">{product.price}</span>
            </DetailCell>
            <DetailCell label="Category">
              {product.category || "—"}
            </DetailCell>
            <DetailCell label="Tag">{product.tag || "—"}</DetailCell>
            <DetailCell label="Sizes" className="col-span-2 sm:col-span-1">
              {product.sizes.length > 0 ? product.sizes.join(", ") : "—"}
            </DetailCell>
            <DetailCell label="Home section">
              {homeSectionLabel(product.homeSection)}
            </DetailCell>
            <DetailCell label="Status">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  product.isActive
                    ? "bg-green-50 text-green-800"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {product.isActive ? "Active" : "Hidden"}
              </span>
            </DetailCell>
          </dl>
        </section>
      </div>
    </AdminDrawer>
  );
}
