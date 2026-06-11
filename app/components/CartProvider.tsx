"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { previewCheckoutPricing } from "@/app/actions/checkout";
import { createPreorder } from "@/app/actions/preorders";
import { useCustomer } from "@/app/components/CustomerProvider";
import { CheckoutContactAccordion } from "@/app/components/CheckoutContactAccordion";
import { DiscountAppliedNotice } from "@/app/components/DiscountAppliedNotice";
import { CartLinePrice } from "@/app/components/ProductPrice";
import { LocationAutocomplete } from "@/app/components/LocationAutocomplete";
import { PaymentProofUpload } from "@/app/components/PaymentProofUpload";
import { PreorderSuccessCelebration } from "@/app/components/PreorderSuccessCelebration";
import type { Product } from "@/app/components/ProductCard";
import { SizeSelect } from "@/app/components/SizeSelect";
import type { CheckoutPricing } from "@/app/lib/discounts/types";
import {
  PICKUP_DETAILS,
  type FulfillmentType,
} from "@/app/lib/preorders/constants";
import {
  PAYMENT_BANK_DETAILS,
  PAYMENT_INSTRUCTIONS,
} from "@/app/lib/payments/constants";
import {
  initialPreorderState,
  type CartItem,
  type CreatePreorderState,
} from "@/app/lib/preorders/types";

const CART_STORAGE_KEY = "twc-preorder-cart";

function getCartQuantity(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

type CartContextValue = {
  items: CartItem[];
  cartQuantity: number;
  isOpen: boolean;
  addItem: (product: Product, selectedSize: string) => void;
  updateItemSize: (productId: string, selectedSize: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getPriceValue(price: string) {
  const value = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function getTotalLabel(items: CartItem[]) {
  const total = items.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0
  );

  return `GHS ${new Intl.NumberFormat("en-GH", {
    maximumFractionDigits: 2,
  }).format(total)}`;
}

function parseStoredCartItem(value: unknown): CartItem | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const item = value as Partial<CartItem>;

  if (
    !item.productId ||
    !item.name ||
    !item.price ||
    !item.selectedSize ||
    !Array.isArray(item.sizes)
  ) {
    return null;
  }

  const quantity =
    typeof item.quantity === "number" && item.quantity > 0
      ? Math.min(Math.trunc(item.quantity), 99)
      : 1;

  return {
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image ?? "",
    selectedSize: item.selectedSize,
    sizes: item.sizes,
    quantity,
    ...(item.category ? { category: item.category } : {}),
  };
}

function CartDrawer({
  state,
  formAction,
  pending,
  onResetState,
  onClearErrors,
}: {
  state: CreatePreorderState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  onResetState: () => void;
  onClearErrors: () => void;
}) {
  const {
    items,
    cartQuantity,
    isOpen,
    closeCart,
    removeItem,
    updateItemSize,
    updateItemQuantity,
  } = useCart();
  const { customer, isAuthenticated, fullName, billingAddress } = useCustomer();
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("delivery");
  const [discountCode, setDiscountCode] = useState("");
  const [pricing, setPricing] = useState<CheckoutPricing | null>(null);
  const [addressMode, setAddressMode] = useState<"billing" | "custom">(
    billingAddress ? "billing" : "custom"
  );
  const [checkoutStep, setCheckoutStep] = useState<"details" | "payment">(
    "details"
  );

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setPricing(null);
      return;
    }

    let cancelled = false;

    void previewCheckoutPricing(items, discountCode).then((nextPricing) => {
      if (!cancelled) {
        setPricing(nextPricing);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [discountCode, isOpen, items]);

  useEffect(() => {
    if (state.fieldErrors?.paymentProof) {
      setCheckoutStep("payment");
    }
  }, [state.fieldErrors?.paymentProof]);

  const totalLabel = pricing?.totalLabel ?? getTotalLabel(items);
  const subtotalLabel = pricing?.subtotalLabel ?? getTotalLabel(items);
  const discountLabel = pricing?.discountLabel ?? null;
  const hasDiscount = Boolean(pricing && pricing.discountAmount > 0);
  const secretCodeApplied =
    Boolean(discountCode.trim()) &&
    pricing?.appliedDiscountCode?.toUpperCase() === discountCode.trim().toUpperCase();
  const secretCodeInvalid =
    Boolean(discountCode.trim()) &&
    pricing !== null &&
    !secretCodeApplied &&
    pricing.discountAmount === 0;
  const autoDiscountApplied =
    hasDiscount &&
    !discountCode.trim() &&
    Boolean(pricing?.appliedDiscountName);

  const handleClose = () => {
    if (state.status === "success") {
      onResetState();
    }
    setCheckoutStep("details");
    closeCart();
  };

  const proceedToPayment = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const form = event.currentTarget.form;

    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    if (fulfillmentType === "delivery") {
      if (addressMode === "custom" || !billingAddress) {
        const locationInput = form.elements.namedItem(
          "customerLocation"
        ) as HTMLInputElement | null;

        if (!locationInput?.value.trim()) {
          return;
        }
      }
    }

    onClearErrors();
    setCheckoutStep("payment");
  };

  return (
    <div
      className={`fixed inset-0 z-[90] transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white text-black shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              Pre-order cart
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {cartQuantity} {cartQuantity === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={handleClose}
            className="pressable flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-black transition-colors hover:border-black active:border-black active:bg-neutral-100"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {state.status !== "success" && !isAuthenticated ? (
          <div className="flex min-h-0 flex-1 flex-col px-5 py-8">
            <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center text-center">
              <h3 className="text-xl font-medium tracking-tight text-black">
                Sign in to checkout
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Create an account or sign in with your email and password before
                completing your pre-order.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/account/login?redirect=/shop"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Sign in
                </Link>
                <Link
                  href="/account/register?redirect=/shop"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-5 text-sm font-semibold text-black transition-colors hover:border-black"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        ) : state.status !== "success" ? (
        <form
          id="preorder-form"
          action={formAction}
          encType="multipart/form-data"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {checkoutStep === "payment" ? (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Step 2 of 2
                  </p>
                  <h3 className="mt-2 text-lg font-medium text-black">
                    Make payment
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Pay {totalLabel} using the details below, then upload your
                    proof of payment.
                  </p>
                </div>

                <div className="rounded-md border border-purple-100 bg-purple-50 px-4 py-4 text-sm leading-6 text-purple-950">
                  <p className="font-medium">Bank details</p>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-purple-900/70">Bank</dt>
                      <dd>{PAYMENT_BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-purple-900/70">Account name</dt>
                      <dd>{PAYMENT_BANK_DETAILS.accountName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-purple-900/70">Account number</dt>
                      <dd>{PAYMENT_BANK_DETAILS.accountNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-purple-900/70">Branch</dt>
                      <dd>{PAYMENT_BANK_DETAILS.branch}</dd>
                    </div>
                  </dl>
                </div>

                <ul className="space-y-2 text-sm leading-6 text-neutral-600">
                  {PAYMENT_INSTRUCTIONS.map((instruction) => (
                    <li key={instruction} className="flex gap-2">
                      <span className="text-purple-950">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>

                <PaymentProofUpload error={state.fieldErrors?.paymentProof} />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-md border border-dashed border-neutral-200 px-4 py-10 text-center">
                <p className="text-sm font-medium text-black">
                  Your cart is empty.
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Choose a size on any product to add it here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Step 1 of 2
                  </p>
                  <h3 className="mt-2 text-base font-medium text-black">
                    Order details
                  </h3>
                </div>
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="flex gap-4 border-b border-neutral-100 pb-4"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-medium leading-5 text-black">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs text-neutral-500">
                            <CartLinePrice
                              price={item.price}
                              productId={item.productId}
                              quantity={item.quantity}
                            />
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="pressable text-xs text-neutral-400 transition-colors hover:text-black active:text-neutral-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-neutral-500">
                          Size
                          <SizeSelect
                            value={item.selectedSize}
                            options={item.sizes}
                            aria-label={`Select size for ${item.name}`}
                            onChange={(size) =>
                              updateItemSize(item.productId, size)
                            }
                          />
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Qty</span>
                          <div className="flex items-center rounded-md border border-neutral-200">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                updateItemQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="pressable flex h-8 w-8 items-center justify-center text-sm text-black transition-colors hover:bg-neutral-100 active:bg-neutral-200"
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center text-xs font-medium text-black">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                updateItemQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="pressable flex h-8 w-8 items-center justify-center text-sm text-black transition-colors hover:bg-neutral-100 active:bg-neutral-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <input type="hidden" name="items" value={JSON.stringify(items)} />

            <div
              className={`mt-6 grid grid-cols-1 gap-4 ${
                checkoutStep === "payment" ? "hidden" : ""
              }`}
            >
              <CheckoutContactAccordion
                fullName={fullName}
                email={customer?.email ?? ""}
                phone={customer?.phone ?? ""}
                fieldErrors={state.fieldErrors}
              />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                  Fulfillment
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`pressable flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                      fulfillmentType === "delivery"
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 text-black hover:border-neutral-400 active:border-neutral-500 active:bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillmentType"
                      value="delivery"
                      checked={fulfillmentType === "delivery"}
                      onChange={() => setFulfillmentType("delivery")}
                      className="sr-only"
                    />
                    Delivery
                  </label>
                  <label
                    className={`pressable flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                      fulfillmentType === "pickup"
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 text-black hover:border-neutral-400 active:border-neutral-500 active:bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillmentType"
                      value="pickup"
                      checked={fulfillmentType === "pickup"}
                      onChange={() => setFulfillmentType("pickup")}
                      className="sr-only"
                    />
                    Pickup
                  </label>
                </div>
                {state.fieldErrors?.fulfillmentType &&
                fulfillmentType !== "delivery" &&
                fulfillmentType !== "pickup" ? (
                  <p className="text-xs text-red-600">
                    {state.fieldErrors.fulfillmentType}
                  </p>
                ) : null}
              </div>

              {fulfillmentType === "delivery" ? (
                <div className="flex flex-col gap-3">
                  {billingAddress ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                        Delivery address
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        <label
                          className={`pressable flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
                            addressMode === "billing"
                              ? "border-black bg-neutral-50"
                              : "border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressModeChoice"
                            checked={addressMode === "billing"}
                            onChange={() => setAddressMode("billing")}
                            className="mt-1"
                          />
                          <span>
                            <span className="block font-medium text-black">
                              Use billing address
                            </span>
                            <span className="mt-1 block text-neutral-500">
                              {billingAddress}
                            </span>
                          </span>
                        </label>
                        <label
                          className={`pressable flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
                            addressMode === "custom"
                              ? "border-black bg-neutral-50"
                              : "border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressModeChoice"
                            checked={addressMode === "custom"}
                            onChange={() => setAddressMode("custom")}
                          />
                          <span className="font-medium text-black">
                            Use a different address for this order
                          </span>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {addressMode === "custom" || !billingAddress ? (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="customerLocation"
                        className="text-xs font-medium uppercase tracking-widest text-neutral-500"
                      >
                        {billingAddress
                          ? "Different delivery address"
                          : "Delivery address"}
                      </label>
                      <LocationAutocomplete
                        id="customerLocation"
                        name="customerLocation"
                        required={addressMode === "custom" || !billingAddress}
                        placeholder="Start typing your delivery address"
                        className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none transition-colors focus:border-black"
                      />
                    </div>
                  ) : (
                    <input
                      type="hidden"
                      name="customerLocation"
                      value={billingAddress ?? ""}
                    />
                  )}

                  {state.fieldErrors?.customerLocation && (
                    <p className="text-xs text-red-600">
                      {state.fieldErrors.customerLocation}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <input type="hidden" name="customerLocation" value="" />
                  <div className="rounded-md border border-purple-100 bg-purple-50 px-4 py-3 text-sm leading-6 text-purple-950">
                    <p className="font-medium">Pickup selected</p>
                    <p className="mt-1 text-purple-900/80">{PICKUP_DETAILS}</p>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="discountCode"
                  className="text-xs font-medium uppercase tracking-widest text-neutral-500"
                >
                  Discount code
                </label>
                <input
                  id="discountCode"
                  name="discountCode"
                  type="text"
                  value={discountCode}
                  onChange={(event) =>
                    setDiscountCode(event.target.value.toUpperCase())
                  }
                  placeholder="Enter a secret code"
                  className="h-10 rounded-md border border-neutral-200 px-3 text-sm uppercase outline-none transition-colors focus:border-black"
                />
                {state.fieldErrors?.discountCode && (
                  <p className="text-xs text-red-600">
                    {state.fieldErrors.discountCode}
                  </p>
                )}
                {secretCodeApplied && pricing?.appliedDiscountName ? (
                  <DiscountAppliedNotice
                    message={`Code applied: ${pricing.appliedDiscountName}`}
                  />
                ) : null}
                {secretCodeInvalid ? (
                  <p className="text-xs text-red-600">
                    This discount code is invalid or expired.
                  </p>
                ) : null}
                <p className="text-xs text-neutral-500">
                  General and product discounts are applied automatically.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="customerNotes"
                  className="text-xs font-medium uppercase tracking-widest text-neutral-500"
                >
                  Notes
                </label>
                <textarea
                  id="customerNotes"
                  name="customerNotes"
                  rows={3}
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-black"
                />
              </div>
            </div>

            {state.fieldErrors?.items && (
              <p className="mt-4 text-xs text-red-600">
                {state.fieldErrors.items}
              </p>
            )}
          </div>

          <div className="border-t border-neutral-100 px-5 py-4">
            {state.status === "error" && state.message && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                {state.message}
              </p>
            )}
            <div className="mb-4 space-y-2 text-sm">
              {autoDiscountApplied ? (
                <DiscountAppliedNotice
                  message={`${pricing?.appliedDiscountName} applied automatically`}
                />
              ) : null}
              {hasDiscount ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-neutral-400 line-through">
                      {subtotalLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-purple-950">
                    <span>Discount</span>
                    <span>{discountLabel}</span>
                  </div>
                </>
              ) : null}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Total</span>
                <span className="text-base font-medium text-black">
                  {totalLabel}
                </span>
              </div>
            </div>
            <button
              type={checkoutStep === "payment" ? "submit" : "button"}
              onClick={
                checkoutStep === "details" ? proceedToPayment : undefined
              }
              disabled={pending || items.length === 0}
              className="pressable flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {pending
                ? "Submitting..."
                : checkoutStep === "payment"
                  ? "Submit payment proof"
                  : "Proceed to payment"}
            </button>
            {checkoutStep === "payment" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  onClearErrors();
                  setCheckoutStep("details");
                }}
                className="pressable mt-3 flex h-11 w-full items-center justify-center rounded-full border border-neutral-200 px-5 text-sm font-semibold text-black transition-colors hover:border-black"
              >
                Back to details
              </button>
            ) : null}
          </div>
        </form>
        ) : null}
      </aside>
    </div>
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [state, setState] = useState<CreatePreorderState>(
    initialPreorderState
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        try {
          const parsed: unknown = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setItems(
              parsed
                .map(parseStoredCartItem)
                .filter((item): item is CartItem => Boolean(item))
            );
          }
        } catch {
          window.localStorage.removeItem(CART_STORAGE_KEY);
        }
      }

      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hasHydrated, items]);

  const addItem = useCallback((product: Product, selectedSize: string) => {
    const sizes = product.sizes?.length ? product.sizes : ["One size"];

    setItems((currentItems) => {
      const nextItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        selectedSize,
        sizes,
        quantity: 1,
        ...(product.category ? { category: product.category } : {}),
      };

      const existingItem = currentItems.find(
        (item) => item.productId === product.id
      );

      if (!existingItem) {
        return [...currentItems, nextItem];
      }

      return currentItems.map((item) => {
        if (item.productId !== product.id) {
          return item;
        }

        const sizeChanged = item.selectedSize !== selectedSize;

        return {
          ...item,
          ...nextItem,
          quantity: sizeChanged ? 1 : item.quantity + 1,
        };
      });
    });

    setIsOpen(true);
  }, []);

  const updateItemSize = useCallback(
    (productId: string, selectedSize: string) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId ? { ...item, selectedSize } : item
        )
      );
    },
    []
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.productId !== productId)
        );
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, 99) }
            : item
        )
      );
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const formAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        const nextState = await createPreorder(state, formData);
        setState(nextState);

        if (nextState.status === "success") {
          clearCart();
        }
      });
    },
    [clearCart, state]
  );

  const cartQuantity = useMemo(() => getCartQuantity(items), [items]);

  const value = useMemo(
    () => ({
      items,
      cartQuantity,
      isOpen,
      addItem,
      updateItemSize,
      updateItemQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      items,
      cartQuantity,
      isOpen,
      addItem,
      updateItemSize,
      updateItemQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    ]
  );

  const handleSuccessClose = useCallback(() => {
    setState(initialPreorderState);
    setIsOpen(false);
  }, []);

  const clearCheckoutErrors = useCallback(() => {
    setState((current) => ({
      ...current,
      status: current.status === "error" ? "idle" : current.status,
      message: "",
      fieldErrors: undefined,
    }));
  }, []);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer
        state={state}
        formAction={formAction}
        pending={pending}
        onResetState={() => setState(initialPreorderState)}
        onClearErrors={clearCheckoutErrors}
      />
      {state.status === "success" && (
        <PreorderSuccessCelebration
          message={state.message}
          orderReference={state.orderReference}
          onClose={handleSuccessClose}
        />
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
