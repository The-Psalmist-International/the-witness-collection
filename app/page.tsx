"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductsSection } from "./components/ProductsSection";
import { CategoriesSection } from "./components/CategoriesSection";

export default function Home() {
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
    <main className="flex-1 bg-black w-full min-h-screen flex items-center justify-center p-8 md:p-16 overflow-hidden relative text-center">

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

        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      <motion.h1
        className="text-white text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tight leading-tight opacity-90 drop-shadow-sm z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 0.9, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
          animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
          className=""
        >
          The Witness Collection
        </motion.span>
      </motion.h1>

      {/* Main content section */}
      <motion.div
        ref={scrollContainerRef}
        data-lenis-prevent
        className="fixed inset-0 z-50 bg-[#ffffff] text-black flex flex-col overflow-y-auto pb-4 md:pb-6 lg:pb-8"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, delay: 3.5, ease: [0.76, 0, 0.24, 1] }}
      >

        <div
          className={`fixed top-0 left-0 right-0 z-[60] bg-[#ffffff] border-b border-gray-100 flex justify-between items-center px-6 md:px-12 py-4 transition-transform duration-300 ease-in-out ${showFixedNav ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          <HeaderContent />
        </div>

        <motion.header
          className="flex justify-between items-center w-full px-6 md:px-8 lg:px-10 pt-4 md:pt-6 lg:pt-8 flex-shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.2, ease: "easeOut" }}
        >
          <HeaderContent />
        </motion.header>

        <motion.div
          className="relative mx-4 md:mx-6 lg:mx-8 h-[calc(100vh-140px)] min-h-[500px] mt-6 rounded-3xl overflow-hidden bg-gray-100 flex-shrink-0"
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


          <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 flex flex-col md:flex-row justify-between items-end gap-8">


            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4.8, ease: "easeOut" }}
            >
              <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
                Shop now
              </button>
              <button className="bg-white text-black w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="19" x2="19" y2="5"></line>
                  <polyline points="9 5 19 5 19 15"></polyline>
                </svg>
              </button>
            </motion.div>


            <motion.div
              className="text-white text-right md:text-left self-end flex flex-col items-end md:items-start"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 5.0, ease: "easeOut" }}
            >
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-4"
                initial={{ opacity: 1, filter: "blur(24px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 5.1, ease: "easeOut" }}
              >
                The Lamb Collection
              </motion.h2>
              <motion.p
                className="text-sm md:text-base font-medium max-w-md drop-shadow-md"
                initial={{ opacity: 1, filter: "blur(16px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 5.25, ease: "easeOut" }}
              >
                Discover quality products with fast shipping and secure checkout.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>


        <ProductsSection />

        <CategoriesSection categories={[
          { title: "Apparel", image: "/EOSR1279.jpg", link: "#" },
          { title: "Accessories", image: "/EOSR1048.jpg", link: "#" }
        ]} />

        <ProductsSection />

        <CategoriesSection categories={[
          { title: "Apothecary", image: "/healthy-product-olive-oil.jpg", link: "#" },
          // { title: "Books", image: "/holy-communion-concept-with-bible.jpg", link: "#" },


        ]} />

        <ProductsSection />
        <CategoriesSection categories={[
          // { title: "Apothecary", image: "/healthy-product-olive-oil.jpg", link: "#" },
          { title: "Books", image: "/holy-communion-concept-with-bible.jpg", link: "#" },


        ]} />
      </motion.div>
    </main>
  );
}

function HeaderContent() {
  return (
    <>
      <div className="text-lg md:text-lg font-light tracking-tight">
        The Witness Collection
      </div>
      <nav className="hidden md:flex space-x-8 text-sm font-normal">
        <a href="#" className="hover:opacity-50 transition-opacity">Home</a>
        <a href="#" className="hover:opacity-50 transition-opacity">Shop</a>
        <a href="#" className="hover:opacity-50 transition-opacity">About</a>
        <a href="#" className="hover:opacity-50 transition-opacity">Support</a>
        <a href="#" className="hover:opacity-50 transition-opacity">Blog</a>
      </nav>
      <div className="flex items-center">
        <button className="p-2 hover:opacity-50 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </>
  );
}
