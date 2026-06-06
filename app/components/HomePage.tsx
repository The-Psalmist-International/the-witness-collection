"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductsSection } from "./ProductsSection";
import { CategoriesSection } from "./CategoriesSection";
import { FaqSection } from "./FaqSection";
import { CtaSection } from "./CtaSection";
import { FooterSection } from "./FooterSection";
import { PromoBanner, HeaderContent } from "./Navbar";
import type { Product } from "./ProductCard";

type HomePageProps = {
  productGroups: {
    section1: Product[];
    section2: Product[];
    section3: Product[];
  };
};

export function HomePage({ productGroups }: HomePageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [showFixedNav, setShowFixedNav] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const currentScrollY = el.scrollTop;
      if (currentScrollY < lastScrollY.current && currentScrollY > 150) {
        setShowFixedNav(true);
      } else {
        setShowFixedNav(false);
      }
      lastScrollY.current = currentScrollY;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-black p-8 text-center md:p-16">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      >
        <Image
          src="/EOSR1312.jpg"
          alt="The Witness Collection Background"
          fill
          className="object-cover grayscale"
          priority
        />

        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      <motion.h1
        className="z-10 px-4 text-4xl font-medium leading-tight tracking-tight text-white opacity-90 drop-shadow-sm sm:text-5xl md:text-7xl lg:text-[6rem]"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 0.9, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
          animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
          className="inline-block"
        >
          The Witness Collection
        </motion.span>
      </motion.h1>

      <motion.div
        ref={scrollContainerRef}
        data-lenis-prevent
        className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#ffffff] text-black"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, delay: 3.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <div
          className={`fixed left-0 right-0 top-0 z-[60] flex flex-col border-b border-gray-100 bg-[#ffffff] transition-transform duration-300 ease-in-out ${
            showFixedNav ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <PromoBanner />
          <div className="flex w-full items-center justify-between px-6 py-4 md:px-12">
            <HeaderContent />
          </div>
        </div>

        <motion.header
          className="flex w-full flex-shrink-0 flex-col"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.2, ease: "easeOut" }}
        >
          <PromoBanner />
          <div className="flex w-full items-center justify-between px-6 pt-4 md:px-8 md:pt-6 lg:px-10 lg:pt-8">
            <HeaderContent />
          </div>
        </motion.header>

        <motion.div
          className="relative mx-4 mt-6 h-[calc(100vh-140px)] min-h-[500px] flex-shrink-0 overflow-hidden rounded-3xl bg-gray-100 md:mx-6 lg:mx-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 4.4, ease: [0.76, 0, 0.24, 1] }}
        >
          <Image
            src="/hero-bg.png"
            alt="Hero Background"
            fill
            className="object-cover grayscale transition-[filter] duration-500"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-end justify-between gap-8 p-6 md:flex-row md:items-end md:p-12">
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4.8, ease: "easeOut" }}
            >
              <Link
                href="/shop"
                className="pressable rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100 active:bg-gray-200"
              >
                Shop now
              </Link>
              <Link
                href="/shop"
                aria-label="Shop the collection"
                className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-gray-100 active:bg-gray-200"
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
                  <line x1="5" y1="19" x2="19" y2="5" />
                  <polyline points="9 5 19 5 19 15" />
                </svg>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-col items-end self-end text-right text-white md:items-start md:text-left"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 5.0, ease: "easeOut" }}
            >
              <motion.h2
                className="mb-4 text-4xl font-medium tracking-tight md:text-6xl lg:text-7xl"
                initial={{ opacity: 1, filter: "blur(24px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 5.1, ease: "easeOut" }}
              >
                The Lamb Collection
              </motion.h2>
              <motion.p
                className="max-w-md text-sm font-medium drop-shadow-md md:text-base"
                initial={{ opacity: 1, filter: "blur(16px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 5.25, ease: "easeOut" }}
              >
                Discover quality products with fast shipping and secure checkout.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {productGroups.section1.length > 0 && (
          <ProductsSection products={productGroups.section1} />
        )}

        <CategoriesSection
          categories={[
            { title: "Apparel", image: "/EOSR1279.jpg", link: "/shop" },
            { title: "Accessories", image: "/EOSR1048.jpg", link: "/shop" },
          ]}
        />

        {productGroups.section2.length > 0 && (
          <ProductsSection products={productGroups.section2} />
        )}

        <CategoriesSection
          categories={[
            {
              title: "Apothecary",
              image: "/healthy-product-olive-oil.jpg",
              link: "/shop",
            },
          ]}
        />

        {productGroups.section3.length > 0 && (
          <ProductsSection products={productGroups.section3} />
        )}

        <CategoriesSection
          categories={[
            {
              title: "Books",
              image: "/holy-communion-concept-with-bible.jpg",
              link: "/shop",
            },
          ]}
        />

        <FaqSection />
        <CtaSection />
        <FooterSection />
      </motion.div>
    </main>
  );
}
