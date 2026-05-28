"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PromoBanner, HeaderContent } from "../components/Navbar";
import { FooterSection } from "../components/FooterSection";
import { ProductCard, type Product } from "../components/ProductCard";
import { DEFAULT_PRODUCTS } from "../components/ProductsSection";

const SHOP_CATEGORIES = ["All", "Apparel", "Apothecary", "Books & Study Materials", "Accessories"];

const SHOP_PRODUCTS: Product[] = [
  // Apparel
  { ...DEFAULT_PRODUCTS[0], id: "1", category: "Apparel" },
  { ...DEFAULT_PRODUCTS[1], id: "2", category: "Apparel" },
  { ...DEFAULT_PRODUCTS[2], id: "3", category: "Apparel" },
  { ...DEFAULT_PRODUCTS[3], id: "4", category: "Apparel" },
  { ...DEFAULT_PRODUCTS[3], id: "5", name: "The Lamb Hoodie", price: "GHS 450", image: "/EOSR1120.jpg", hoverImage: "/LambWhite.png", category: "Apparel" },
  { ...DEFAULT_PRODUCTS[2], id: "6", name: "Mystic Crewneck", price: "GHS 400", category: "Apparel" },

  // Accessories
  { ...DEFAULT_PRODUCTS[0], id: "8", name: "Bonjour Beanie", price: "GHS 150", category: "Accessories" },
  { ...DEFAULT_PRODUCTS[1], id: "9", name: "Blow Up Cap", price: "GHS 120", image: "/EOSR1279.jpg", hoverImage: "/EOSR1055.jpg", category: "Accessories" },
  { ...DEFAULT_PRODUCTS[0], id: "10", name: "Bonjour Tote", price: "GHS 180", category: "Accessories" },
  { ...DEFAULT_PRODUCTS[3], id: "11", name: "The Lamb Socks", price: "GHS 80", category: "Accessories" },
  { ...DEFAULT_PRODUCTS[2], id: "12", name: "Classic Mystic Pin", price: "GHS 50", category: "Accessories" },

  // Apothecary
  { ...DEFAULT_PRODUCTS[0], id: "13", name: "Anointing Oil - Frankincense", price: "GHS 120", image: "/healthy-product-olive-oil.jpg", hoverImage: "/EOSR1048.jpg", category: "Apothecary", sizes: [] },

  // Books & Study Materials
  { ...DEFAULT_PRODUCTS[1], id: "14", name: "The Psalmist Study Bible", price: "GHS 250", image: "/holy-communion-concept-with-bible.jpg", hoverImage: "/EOSR1067.jpg", category: "Books & Study Materials", sizes: [] },
];

export default function ShopPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const categoriesToDisplay = activeFilter === "All"
    ? SHOP_CATEGORIES.filter(c => c !== "All")
    : [activeFilter];

  return (
    <main className="flex-1 bg-white w-full min-h-screen text-black overflow-x-hidden flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <PromoBanner />
        <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full">
          <HeaderContent />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-20 w-full flex-1">

        {/* Page Header & Filters */}
        <div className="flex flex-col space-y-12 mb-16 md:mb-24">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Shop the Collection
          </motion.h1>

          {/* Filters using Bracket Style */}
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
                className={`text-xs md:text-sm  tracking-widest transition-colors duration-300 cursor-pointer ${activeFilter === category
                  ? "text-black font-semibold"
                  : "text-gray-400 hover:text-gray-700 font-normal"
                  }`}
              >
                ({category})
              </button>
            ))}
          </motion.div>
        </div>

        {/* Product Sections */}
        <div className="space-y-24 md:space-y-32">
          <AnimatePresence mode="popLayout">
            {categoriesToDisplay.map((category) => {
              const categoryProducts = SHOP_PRODUCTS.filter(p => p.category === category);

              if (categoryProducts.length === 0) return null;

              return (
                <motion.section
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8 md:space-y-12 w-full"
                >
                  {/* Category Header (Editorial Style) */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">({category})</p>
                    <div className="w-full h-[1px] bg-gray-100" />
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 w-full">
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
