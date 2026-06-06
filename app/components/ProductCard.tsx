"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateItemQuantity } = useCart();
  const cartItem = items.find((item) => item.productId === product.id);
  const selectedSize = cartItem?.selectedSize;
  const cartQuantity = cartItem?.quantity ?? 0;
  const hasSizes = Boolean(product.sizes?.length);
  const availableSizes = product.sizes?.length ? product.sizes : ["One size"];

  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col group cursor-pointer"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-[#f7f7f7]">
        {product.tag && (
          <span className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs text-[10px] md:text-[11px] font-normal text-neutral-800 px-3 py-1.5 rounded-full tracking-wide shadow-xs border border-neutral-100 select-none">
            {product.tag}
          </span>
        )}

        {cartQuantity > 0 && (
          <span className="absolute top-4 right-4 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-purple-950 px-2 text-[11px] font-medium text-white">
            {cartQuantity}
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover p-4 md:p-6 transition-opacity duration-700 ease-out group-hover:opacity-0"
          priority={true}
        />

        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={`${product.name} alternate`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-opacity duration-700 ease-out opacity-0 group-hover:opacity-100"
            priority={true}
          />
        )}
      </div>

      <div className="mt-4 relative h-12 w-full">
        {hasSizes ? (
          <>
            <div className="absolute inset-0 flex flex-col text-left transition-opacity duration-300 ease-out opacity-100 group-hover:opacity-0 group-hover:pointer-events-none">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900">
                {product.name}
              </h3>
              <span className="text-xs text-neutral-500 font-light mt-1 tracking-tight">
                {product.price}
              </span>
            </div>

            <div className="absolute inset-0 flex flex-wrap items-center justify-start gap-2 transition-opacity duration-300 ease-out opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => addItem(product, size)}
                  aria-pressed={selectedSize === size}
                  className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                    selectedSize === size
                      ? "bg-black text-white"
                      : "text-black hover:bg-neutral-100"
                  }`}
                >
                  {size}
                </button>
              ))}
              {cartQuantity > 0 && (
                <div className="ml-1 flex items-center rounded-md border border-neutral-200 bg-white">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.name}`}
                    onClick={() =>
                      updateItemQuantity(product.id, cartQuantity - 1)
                    }
                    className="flex h-7 w-7 items-center justify-center text-xs text-black transition-colors hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-xs font-medium text-black">
                    {cartQuantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${product.name}`}
                    onClick={() =>
                      updateItemQuantity(product.id, cartQuantity + 1)
                    }
                    className="flex h-7 w-7 items-center justify-center text-xs text-black transition-colors hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 flex flex-col text-left transition-opacity duration-300 ease-out opacity-100 group-hover:opacity-0 group-hover:pointer-events-none">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900">
                {product.name}
              </h3>
              <span className="text-xs text-neutral-500 font-light mt-1 tracking-tight">
                {product.price}
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-start gap-2 transition-opacity duration-300 ease-out opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              <button
                type="button"
                onClick={() => addItem(product, availableSizes[0])}
                className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-black transition-colors hover:border-black"
              >
                Pre-order
              </button>
              {cartQuantity > 0 && (
                <div className="flex items-center rounded-md border border-neutral-200 bg-white">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.name}`}
                    onClick={() =>
                      updateItemQuantity(product.id, cartQuantity - 1)
                    }
                    className="flex h-7 w-7 items-center justify-center text-xs text-black transition-colors hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-xs font-medium text-black">
                    {cartQuantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${product.name}`}
                    onClick={() =>
                      updateItemQuantity(product.id, cartQuantity + 1)
                    }
                    className="flex h-7 w-7 items-center justify-center text-xs text-black transition-colors hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
