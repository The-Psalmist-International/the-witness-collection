"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOP_FILTER_CATEGORIES } from "@/app/lib/products/categories";
import {
  PromoBanner,
  HeaderContent,
  SHOP_SEARCH_EVENT,
} from "@/app/components/Navbar";
import { FooterSection } from "@/app/components/FooterSection";
import { ProductCard, type Product } from "@/app/components/ProductCard";

const SHOP_CATEGORIES = [...SHOP_FILTER_CATEGORIES];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, " ")
    .trim();
}

function buildSearchText(product: Product) {
  return normalize(
    [
      product.name,
      product.category,
      product.subcategory,
      product.tag,
      product.price,
      ...(product.sizes ?? []),
      ...(product.colors ?? []).map((color) => color.name),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

// Every word in the query must appear somewhere in the product text, so
// "black hoodie" matches "Hoodie — Black". A trailing "s" is ignored so
// "hoodies" / "caps" / "books" still match.
function matchesQuery(searchText: string, terms: string[]) {
  return terms.every((term) => {
    if (searchText.includes(term)) {
      return true;
    }

    return term.length > 3 && term.endsWith("s")
      ? searchText.includes(term.slice(0, -1))
      : false;
  });
}

export function ShopPageClient({
  products,
  initialQuery = "",
}: {
  products: Product[];
  initialQuery?: string;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Keep the box in sync when a new search arrives from the navbar while
  // already on /shop.
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setSearchQuery(initialQuery);
    setActiveFilter("All");
  }

  // Searches submitted from the navbar while already on /shop.
  useEffect(() => {
    const onSearch = (event: Event) => {
      const query = (event as CustomEvent<string>).detail ?? "";
      setSearchQuery(query);
      setActiveFilter("All");
    };

    window.addEventListener(SHOP_SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(SHOP_SEARCH_EVENT, onSearch);
  }, []);

  // Reflect the query in the URL so results can be shared / survive refresh.
  useEffect(() => {
    const url = new URL(window.location.href);
    const trimmed = searchQuery.trim();

    if (trimmed) {
      url.searchParams.set("q", trimmed);
    } else {
      url.searchParams.delete("q");
    }

    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [searchQuery]);

  const searchIndex = useMemo(
    () =>
      products.map((product) => ({
        product,
        text: buildSearchText(product),
      })),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const terms = normalize(searchQuery).split(" ").filter(Boolean);

    if (terms.length === 0) {
      return products;
    }

    return searchIndex
      .filter(({ text }) => matchesQuery(text, terms))
      .map(({ product }) => product);
  }, [products, searchIndex, searchQuery]);

  const trimmedQuery = searchQuery.trim();
  const visibleCount =
    activeFilter === "All"
      ? filteredProducts.filter((product) => product.category).length
      : filteredProducts.filter((product) => product.category === activeFilter)
          .length;

  const categoriesToDisplay = useMemo(() => {
    if (activeFilter === "All") {
      const categories = new Set(
        filteredProducts
          .map((product) => product.category)
          .filter(Boolean) as string[]
      );
      return Array.from(categories);
    }

    return [activeFilter];
  }, [activeFilter, filteredProducts]);

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
            className="max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="relative"
            >
              <input
                type="search"
                name="q"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchQuery("");
                  }
                }}
                placeholder="Search products by name, category, colour, or price"
                aria-label="Search products"
                className="h-11 w-full rounded-full border border-neutral-200 pl-5 pr-20 text-sm outline-none transition-colors focus:border-black [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="pressable absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black"
                >
                  Clear
                </button>
              )}
            </form>
            {trimmedQuery && (
              <p className="mt-3 text-xs text-gray-500" aria-live="polite">
                {visibleCount} {visibleCount === 1 ? "result" : "results"} for
                &ldquo;{trimmedQuery}&rdquo;
                {activeFilter !== "All" ? ` in ${activeFilter}` : ""}
              </p>
            )}
          </motion.div>

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

        {visibleCount === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg font-medium">
              {trimmedQuery
                ? `No products match “${trimmedQuery}”`
                : "No products here yet"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try a different word, check the spelling, or browse all products.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="pressable mt-6 rounded-full border border-black px-5 py-2 text-sm hover:bg-black hover:text-white"
            >
              Show all products
            </button>
          </div>
        )}

        <div className="space-y-24 md:space-y-32">
          <AnimatePresence mode="popLayout">
            {categoriesToDisplay.map((category) => {
              const categoryProducts = filteredProducts.filter(
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
