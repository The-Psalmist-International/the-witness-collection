"use client";

import { useMemo, useState, useTransition } from "react";
import { addDiscount } from "@/app/admin/actions";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import { PlusIcon } from "@/app/admin/AdminIcons";
import { StyledSelect } from "@/app/components/StyledSelect";
import type { ProductRecord } from "@/app/lib/db/schema";

type AddDiscountDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  products: ProductRecord[];
};

const TYPE_OPTIONS = [
  { value: "percent", label: "Percentage" },
  { value: "fixed", label: "Fixed amount (GHS)" },
];

const SCOPE_OPTIONS = [
  { value: "general", label: "General (all orders)" },
  { value: "product", label: "Specific products" },
  { value: "secret", label: "Secret code" },
];

export function AddDiscountDrawer({
  isOpen,
  onClose,
  products,
}: AddDiscountDrawerProps) {
  const [scope, setScope] = useState("general");
  const [pending, startTransition] = useTransition();

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products]
  );

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await addDiscount(formData);
        onClose();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Discounts"
      title="Create discount"
      subtitle="General and product discounts apply automatically. Secret codes can apply to the whole order or selected products."
      footer={
        <button
          type="submit"
          form="add-discount-form"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-purple-300"
        >
          <PlusIcon />
          {pending ? "Creating..." : "Create discount"}
        </button>
      }
    >
      <form id="add-discount-form" action={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="discountName"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Name
          </label>
          <input
            id="discountName"
            name="name"
            type="text"
            required
            placeholder="Summer launch offer"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="discountType"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Type
            </label>
            <StyledSelect
              id="discountType"
              name="type"
              required
              options={TYPE_OPTIONS}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="discountValue"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Value
            </label>
            <input
              id="discountValue"
              name="value"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="10"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="discountScope"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Application
          </label>
          <select
            id="discountScope"
            name="scope"
            required
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {scope === "secret" ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="discountCode"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Secret code
            </label>
            <input
              id="discountCode"
              name="code"
              type="text"
              required
              placeholder="WITNESS20"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm uppercase outline-none focus:border-purple-950"
            />
          </div>
        ) : (
          <input type="hidden" name="code" value="" />
        )}

        {scope === "product" || scope === "secret" ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="discountProducts"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              {scope === "secret" ? "Products (optional)" : "Products"}
            </label>
            <select
              id="discountProducts"
              name="productIds"
              multiple
              required={scope === "product"}
              className="min-h-32 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-purple-950"
            >
              {productOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              {scope === "secret"
                ? "Leave empty to apply the code to the whole order. Select products to limit the code to those items only."
                : "Hold Ctrl or Cmd to select multiple products."}
            </p>
          </div>
        ) : (
          <input type="hidden" name="productIds" value="" />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="discountStartsAt"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Starts (optional)
            </label>
            <input
              id="discountStartsAt"
              name="startsAt"
              type="datetime-local"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="discountEndsAt"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Ends (optional)
            </label>
            <input
              id="discountEndsAt"
              name="endsAt"
              type="datetime-local"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="discountMaxUses"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Max uses (optional)
          </label>
          <input
            id="discountMaxUses"
            name="maxUses"
            type="number"
            min="1"
            step="1"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <input type="hidden" name="isActive" value="true" />
      </form>
    </AdminDrawer>
  );
}
