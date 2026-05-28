"use client";

import Link from "next/link";

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
  return (
    <>
      <Link href="/" className="text-lg md:text-lg font-light tracking-tight hover:opacity-70 transition-opacity">
        The Witness Collection
      </Link>
      <nav className="hidden md:flex space-x-8 text-sm font-normal">
        <Link href="/" className="hover:opacity-50 transition-opacity">Home</Link>
        <Link href="/shop" className="hover:opacity-50 transition-opacity">Shop</Link>
        <Link href="/about" className="hover:opacity-50 transition-opacity">About</Link>
        <Link href="/support" className="hover:opacity-50 transition-opacity">Support</Link>
        <Link href="/blog" className="hover:opacity-50 transition-opacity">Blog</Link>
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
