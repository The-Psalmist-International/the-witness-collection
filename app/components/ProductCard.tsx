"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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

      <div className="mt-4 relative h-10 w-full">
        {product.sizes && product.sizes.length > 0 ? (
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
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className="text-xs font-medium text-black px-2 py-1 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </>
        ) : (

          <div className="absolute inset-0 flex flex-col text-left">
            <h3 className="text-sm font-medium tracking-tight text-neutral-900">
              {product.name}
            </h3>
            <span className="text-xs text-neutral-500 font-light mt-1 tracking-tight">
              {product.price}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
