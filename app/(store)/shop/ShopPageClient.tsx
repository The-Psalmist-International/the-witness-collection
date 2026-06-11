"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOP_FILTER_CATEGORIES } from "@/app/lib/products/categories";
import { PromoBanner, HeaderContent } from "@/app/components/Navbar";
import { FooterSection } from "@/app/components/FooterSection";
import { ProductCard, type Product } from "@/app/components/ProductCard";

const SHOP_CATEGORIES = [...SHOP_FILTER_CATEGORIES];

export function ShopPageClient({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const categoriesToDisplay = useMemo(() => {
    if (activeFilter === "All") {
      const categories = new Set(
        products.map((product) => product.category).filter(Boolean) as string[]
      );
      return Array.from(categories);
    }

    return [activeFilter];
  }, [activeFilter, products]);

  return (
    <main className="flex min-h-screen w-full flex-1 flex-col overflow-x-hidden bg-white text-black">
      <div className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <PromoBanner />
        <div className="flex w-full items-center justify-between px-6 py-4 md:px-12">
          <HeaderContent />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:px-10 md:py-20 lg:px-12">
        <div className="mb-16 flex flex-col space-y-12 md:mb-24">
          <motion.h1
            className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Shop the Collection
          </motion.h1>

          <motion.div
            className="flex flex-wrap gap-4 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {SHOP_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`pressable cursor-pointer text-xs tracking-widest transition-colors duration-300 md:text-sm ${
                  activeFilter === category
                    ? "font-semibold text-black"
                    : "font-light text-gray-400 hover:text-gray-700 active:text-gray-900"
                }`}
              >
                ({category})
              </button>
            ))}
          </motion.div>
        </div>

        <div className="space-y-24 md:space-y-32">
          <AnimatePresence mode="popLayout">
            {categoriesToDisplay.map((category) => {
              const categoryProducts = products.filter(
                (product) => product.category === category
              );

              if (categoryProducts.length === 0) {
                return null;
              }

              return (
                <motion.section
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full space-y-8 md:space-y-12"
                >
                  <div>
                    <p className="mb-4 text-xs uppercase tracking-widest text-gray-500">
                      ({category})
                    </p>
                    <div className="h-px w-full bg-gray-100" />
                  </div>

                  <div className="grid w-full grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <FooterSection />
    </main>
  );
}
