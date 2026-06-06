"use client";

import { useTransition } from "react";
import { editProduct } from "@/app/admin/actions";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import { PencilIcon } from "@/app/admin/AdminIcons";
import { ProductImageUpload } from "@/app/admin/ProductImageUpload";
import { StyledSelect } from "@/app/components/StyledSelect";
import { PRODUCT_CATEGORIES } from "@/app/lib/products/categories";
import type { DbProduct } from "@/app/lib/products/types";

type EditProductDrawerProps = {
  product: DbProduct | null;
  onClose: () => void;
};

const HOME_SECTION_OPTIONS = [
  { value: "", label: "Shop only" },
  { value: "1", label: "Home section 1" },
  { value: "2", label: "Home section 2" },
  { value: "3", label: "Home section 3" },
];

export function EditProductDrawer({ product, onClose }: EditProductDrawerProps) {
  const [pending, startTransition] = useTransition();

  if (!product) {
    return null;
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await editProduct(formData);
      onClose();
    });
  };

  return (
    <AdminDrawer
      isOpen={Boolean(product)}
      onClose={onClose}
      eyebrow="Products"
      title="Edit product"
      subtitle={product.name}
      footer={
        <button
          type="submit"
          form="edit-product-form"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-purple-300"
        >
          <PencilIcon />
          {pending ? "Saving..." : "Save changes"}
        </button>
      }
    >
      <form
        key={product.id}
        id="edit-product-form"
        action={handleSubmit}
        className="space-y-4"
      >
        <input type="hidden" name="productId" value={product.id} />

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`edit-productName-${product.id}`}
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Name
          </label>
          <input
            id={`edit-productName-${product.id}`}
            name="name"
            required
            defaultValue={product.name}
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`edit-productPrice-${product.id}`}
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Price
          </label>
          <input
            id={`edit-productPrice-${product.id}`}
            name="price"
            required
            defaultValue={product.price}
            placeholder="GHS 250"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <ProductImageUpload
          key={`${product.id}-image`}
          id={`edit-productImage-${product.id}`}
          name="image"
          label="Product image"
          required
          defaultUrl={product.image}
        />

        <ProductImageUpload
          key={`${product.id}-hover`}
          id={`edit-productHoverImage-${product.id}`}
          name="hoverImage"
          label="Hover image"
          defaultUrl={product.hoverImage ?? ""}
        />

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`edit-productCategory-${product.id}`}
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Category
          </label>
          <StyledSelect
            id={`edit-productCategory-${product.id}`}
            name="category"
            required
            defaultValue={product.category ?? ""}
            placeholder="Select a category"
            options={PRODUCT_CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`edit-productTag-${product.id}`}
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Tag
          </label>
          <input
            id={`edit-productTag-${product.id}`}
            name="tag"
            defaultValue={product.tag ?? ""}
            placeholder="Most Wanted"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`edit-productSizes-${product.id}`}
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Sizes
          </label>
          <input
            id={`edit-productSizes-${product.id}`}
            name="sizes"
            defaultValue={product.sizes.join(", ")}
            placeholder="XS, S, M, L, XL"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`edit-productHomeSection-${product.id}`}
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Home section
          </label>
          <StyledSelect
            id={`edit-productHomeSection-${product.id}`}
            name="homeSection"
            defaultValue={product.homeSection?.toString() ?? ""}
            options={HOME_SECTION_OPTIONS}
          />
        </div>
      </form>
    </AdminDrawer>
  );
}
