"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { PromoBanner } from "./PromoBanner";
import { useCart } from "./CartProvider";
import { useCustomer } from "./CustomerProvider";

export { PromoBanner };

export function HeaderContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { cartQuantity, openCart } = useCart();
  const { isAuthenticated } = useCustomer();
  const profileHref = isAuthenticated
    ? "/account/settings/profile"
    : "/account/login?redirect=/account/settings/profile";

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchInputRef.current?.value;
    if (query) {
      router.push(`/shop?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Support", href: "/support" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <>
      <BrandLogo
        href="/"
        size="sm"
        className="relative z-50"
        wordmarkClassName="text-sm font-light tracking-tight md:text-lg"
      />

      <nav className="hidden md:flex space-x-8 text-sm font-normal">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="pressable capitalize transition-opacity hover:opacity-50 active:opacity-30"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 relative z-50 text-black">
        <div className="flex items-center">
          <form
            onSubmit={handleSearch}
            className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
              isSearchOpen ? "w-[120px] md:w-[200px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <input
              ref={searchInputRef}
              type="search"
              name="q"
              placeholder="Search..."
              className="w-full bg-neutral-100 rounded-full py-1.5 px-4 text-sm outline-none border border-neutral-200 focus:border-black transition-colors"
            />
          </form>
          <button 
            type="button" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="pressable p-2 transition-opacity hover:opacity-50 active:opacity-30"
            aria-label="Toggle search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isSearchOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        <Link
          href={profileHref}
          aria-label={isAuthenticated ? "Account settings" : "Sign in"}
          className="pressable relative p-2 transition-opacity hover:opacity-50 active:opacity-30"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>

        <button
          type="button"
          aria-label="Open cart"
          onClick={openCart}
          className="pressable relative p-2 transition-opacity hover:opacity-50 active:opacity-30"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
          {cartQuantity > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-950 px-1 text-[10px] leading-none text-white">
              {cartQuantity}
            </span>
          )}
        </button>

        <button
          type="button"
          className="pressable p-2 transition-opacity hover:opacity-50 active:opacity-30 focus:outline-none md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    className="pressable text-4xl font-medium tracking-tight capitalize transition-opacity hover:opacity-50 active:opacity-30 md:text-5xl"
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
