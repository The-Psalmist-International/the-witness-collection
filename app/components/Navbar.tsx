"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PromoBanner() {
  return (
    <div className="w-full bg-[#3b0764] relative overflow-hidden text-white text-center py-3 px-4 text-xs font-medium tracking-wide">
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          <filter id="noiseFilterBanner">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterBanner)" />
        </svg>
      </div>
      <span className="relative z-10 text-sm font-normal">All items are currently on pre-order.🎁</span>
    </div>
  );
}

export function HeaderContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Support", href: "/support" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <>
      <Link href="/" className="text-lg md:text-lg font-light tracking-tight hover:opacity-70 transition-opacity relative z-50 flex  gap-2 justify-cetner items-center">
        <div className="w-5 h-5 bg-purple-950 rounded-[4px]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)" }} />
        The Witness Collection
      </Link>

      <nav className="hidden md:flex space-x-8 text-sm font-normal">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} className="hover:opacity-50 transition-opacity capitalize">
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 relative z-50 text-black">
        <button className="p-2 hover:opacity-50 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        <button
          className="p-2 md:hidden hover:opacity-50 transition-opacity focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white text-black flex flex-col justify-center items-start px-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 1, 0.5, 1] }}
                >
                  <Link
                    href={link.href}
                    className="text-4xl md:text-5xl font-medium tracking-tight hover:opacity-50 transition-opacity capitalize"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
