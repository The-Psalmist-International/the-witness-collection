"use client";

import { useTransition } from "react";
import { addProduct } from "@/app/admin/actions";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import { PlusIcon } from "@/app/admin/AdminIcons";
import { ProductImageUpload } from "@/app/admin/ProductImageUpload";
import { StyledSelect } from "@/app/components/StyledSelect";
import { PRODUCT_CATEGORIES } from "@/app/lib/products/categories";

type AddProductDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HOME_SECTION_OPTIONS = [
  { value: "", label: "Shop only" },
  { value: "1", label: "Home section 1" },
  { value: "2", label: "Home section 2" },
  { value: "3", label: "Home section 3" },
];

export function AddProductDrawer({ isOpen, onClose }: AddProductDrawerProps) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addProduct(formData);
      onClose();
    });
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Products"
      title="Add product"
      footer={
        <button
          type="submit"
          form="add-product-form"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-purple-300"
        >
          <PlusIcon />
          {pending ? "Adding..." : "Add product"}
        </button>
      }
    >
      <form id="add-product-form" action={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="productName"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Name
            </label>
            <input
              id="productName"
              name="name"
              required
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="productPrice"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Price
            </label>
            <input
              id="productPrice"
              name="price"
              required
              placeholder="GHS 250"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>

          <ProductImageUpload
            id="productImage"
            name="image"
            label="Product image"
            required
          />

          <ProductImageUpload
            id="productHoverImage"
            name="hoverImage"
            label="Hover image"
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="productCategory"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Category
            </label>
            <StyledSelect
              id="productCategory"
              name="category"
              required
              placeholder="Select a category"
              options={PRODUCT_CATEGORIES.map((category) => ({
                value: category,
                label: category,
              }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="productTag"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Tag
            </label>
            <input
              id="productTag"
              name="tag"
              placeholder="Most Wanted"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="productSizes"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Sizes
            </label>
            <input
              id="productSizes"
              name="sizes"
              placeholder="XS, S, M, L, XL"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="productHomeSection"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Home section
            </label>
            <StyledSelect
              id="productHomeSection"
              name="homeSection"
              defaultValue=""
              options={HOME_SECTION_OPTIONS}
            />
          </div>
      </form>
    </AdminDrawer>
  );
}
