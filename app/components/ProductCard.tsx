"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useCanHover } from "@/app/hooks/useCanHover";
import { ProductPrice } from "@/app/components/ProductPrice";
import { useCart } from "./CartProvider";

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage?: string;
  tag?: string;
  sizes?: string[];
  category?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 1, 0.5, 1] as const,
    },
  },
};

function QuantityControls({
  productName,
  productId: _productId,
  cartQuantity,
  onDecrease,
  onIncrease,
}: {
  productName: string;
  productId: string;
  cartQuantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  if (cartQuantity <= 0) {
    return null;
  }

  return (
    <div className="flex items-center rounded-md border border-neutral-200 bg-white">
      <button
        type="button"
        aria-label={`Decrease quantity of ${productName}`}
        onClick={onDecrease}
        className="flex h-7 w-7 items-center justify-center text-xs text-black transition-colors hover:bg-neutral-100 active:bg-neutral-200"
      >
        −
      </button>
      <span className="min-w-6 text-center text-xs font-medium text-black">
        {cartQuantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${productName}`}
        onClick={onIncrease}
        className="flex h-7 w-7 items-center justify-center text-xs text-black transition-colors hover:bg-neutral-100 active:bg-neutral-200"
      >
        +
      </button>
    </div>
  );
}

function SizeButtons({
  product: _product,
  availableSizes,
  selectedSize,
  onSelectSize,
}: {
  product: Product;
  availableSizes: string[];
  selectedSize?: string;
  onSelectSize: (size: string) => void;
}) {
  return (
    <>
      {availableSizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => onSelectSize(size)}
          aria-pressed={selectedSize === size}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            selectedSize === size
              ? "bg-black text-white"
              : "text-black hover:bg-neutral-100 active:bg-neutral-200"
          }`}
        >
          {size}
        </button>
      ))}
    </>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const canHover = useCanHover();
  const [showAlternateImage, setShowAlternateImage] = useState(false);
  const { addItem, items, updateItemQuantity } = useCart();
  const cartItem = items.find((item) => item.productId === product.id);
  const selectedSize = cartItem?.selectedSize;
  const cartQuantity = cartItem?.quantity ?? 0;
  const hasSizes = Boolean(product.sizes?.length);
  const availableSizes = product.sizes?.length ? product.sizes : ["One size"];
  const hasAlternateImage = Boolean(product.hoverImage);
  const displayAlternateImage = hasAlternateImage && showAlternateImage;

  const handleImageTap = () => {
    if (!canHover && hasAlternateImage) {
      setShowAlternateImage((current) => !current);
    }
  };

  return (
    <motion.div variants={cardVariants} className="group flex cursor-pointer flex-col">
      <button
        type="button"
        onClick={handleImageTap}
        aria-label={
          hasAlternateImage
            ? `${product.name}. Tap to ${displayAlternateImage ? "show main" : "show alternate"} image.`
            : product.name
        }
        className={`relative aspect-[4/5] w-full overflow-hidden rounded-md bg-[#f7f7f7] text-left ${
          !canHover && hasAlternateImage ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {product.tag && (
          <span className="pointer-events-none absolute top-4 left-4 z-10 rounded-full border border-neutral-100 bg-white/95 px-3 py-1.5 text-[10px] font-normal tracking-wide text-neutral-800 shadow-xs backdrop-blur-xs select-none md:text-[11px]">
            {product.tag}
          </span>
        )}

        {cartQuantity > 0 && (
          <span className="pointer-events-none absolute top-4 right-4 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-purple-950 px-2 text-[11px] font-medium text-white">
            {cartQuantity}
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover p-4 transition-opacity duration-500 ease-out md:p-6 ${
            canHover
              ? "group-hover:opacity-0"
              : displayAlternateImage
                ? "opacity-0"
                : "opacity-100"
          }`}
          priority={true}
        />

        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={`${product.name} alternate`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-opacity duration-500 ease-out ${
              canHover
                ? "opacity-0 group-hover:opacity-100"
                : displayAlternateImage
                  ? "opacity-100"
                  : "opacity-0"
            }`}
            priority={true}
          />
        )}

        {!canHover && hasAlternateImage && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/55 px-2.5 py-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                displayAlternateImage ? "bg-white/40" : "bg-white"
              }`}
            />
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                displayAlternateImage ? "bg-white" : "bg-white/40"
              }`}
            />
          </span>
        )}
      </button>

      {canHover ? (
        <div className="relative mt-4 h-12 w-full">
          {hasSizes ? (
            <>
              <div className="pointer-events-none absolute inset-0 flex flex-col text-left opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0">
                <h3 className="text-sm font-medium tracking-tight text-neutral-900">
                  {product.name}
                </h3>
                <ProductPrice
                  price={product.price}
                  productId={product.id}
                  className="mt-1 text-xs font-light tracking-tight text-neutral-500"
                  discountedClassName="text-xs font-medium text-purple-950"
                  originalClassName="text-xs font-light text-neutral-400 line-through"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-start gap-2 opacity-0 transition-opacity duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
                <SizeButtons
                  product={product}
                  availableSizes={availableSizes}
                  selectedSize={selectedSize}
                  onSelectSize={(size) => addItem(product, size)}
                />
                <QuantityControls
                  productName={product.name}
                  productId={product.id}
                  cartQuantity={cartQuantity}
                  onDecrease={() => updateItemQuantity(product.id, cartQuantity - 1)}
                  onIncrease={() => updateItemQuantity(product.id, cartQuantity + 1)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-0 flex flex-col text-left opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0">
                <h3 className="text-sm font-medium tracking-tight text-neutral-900">
                  {product.name}
                </h3>
                <ProductPrice
                  price={product.price}
                  productId={product.id}
                  className="mt-1 text-xs font-light tracking-tight text-neutral-500"
                  discountedClassName="text-xs font-medium text-purple-950"
                  originalClassName="text-xs font-light text-neutral-400 line-through"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-start gap-2 opacity-0 transition-opacity duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => addItem(product, availableSizes[0])}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-black transition-colors hover:border-black active:border-black active:bg-neutral-100"
                >
                  Pre-order
                </button>
                <QuantityControls
                  productName={product.name}
                  productId={product.id}
                  cartQuantity={cartQuantity}
                  onDecrease={() => updateItemQuantity(product.id, cartQuantity - 1)}
                  onIncrease={() => updateItemQuantity(product.id, cartQuantity + 1)}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-left">
          <div>
            <h3 className="text-sm font-medium tracking-tight text-neutral-900">
              {product.name}
            </h3>
            <ProductPrice
              price={product.price}
              productId={product.id}
              className="mt-1 block text-xs font-light tracking-tight text-neutral-500"
              discountedClassName="text-xs font-medium text-purple-950"
              originalClassName="text-xs font-light text-neutral-400 line-through"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasSizes ? (
              <SizeButtons
                product={product}
                availableSizes={availableSizes}
                selectedSize={selectedSize}
                onSelectSize={(size) => addItem(product, size)}
              />
            ) : (
              <button
                type="button"
                onClick={() => addItem(product, availableSizes[0])}
                className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-black transition-colors active:border-black active:bg-neutral-100"
              >
                Pre-order
              </button>
            )}
            <QuantityControls
              productName={product.name}
              productId={product.id}
              cartQuantity={cartQuantity}
              onDecrease={() => updateItemQuantity(product.id, cartQuantity - 1)}
              onIncrease={() => updateItemQuantity(product.id, cartQuantity + 1)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
