"use client";

import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-white py-12 md:py-16 px-6 md:px-10 lg:px-12 flex-shrink-0 text-left border-t border-neutral-900">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-24">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="text-xl md:text-2xl font-medium tracking-tight flex items-center gap-3">
            <div
              className="w-5 h-5 bg-white rounded-[4px]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)" }}
            />
            The Witness Collection
          </div>
          <p className="text-xs md:text-sm text-neutral-400 font-light mt-1">
            The Witness Collection - Discover quality products with fast shipping and secure checkout.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 md:gap-24 lg:gap-32">
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Follow
            </h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-sm text-neutral-300 hover:text-white transition-colors">
                TikTok
              </Link>
              <Link href="#" className="text-sm text-neutral-300 hover:text-white transition-colors">
                Instagram
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Resources
            </h4>
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-sm text-neutral-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-sm text-neutral-300 hover:text-white transition-colors">
                Shop
              </Link>
              <Link href="#" className="text-sm text-neutral-300 hover:text-white transition-colors">
                Blog
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Company
            </h4>
            <div className="flex flex-col gap-4">
              <Link href="/about" className="text-sm text-neutral-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="#" className="text-sm text-neutral-300 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 md:mt-24 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs text-neutral-500 font-light">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <span>(c) 2026 The Witness Collection. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-neutral-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span>
            Powered by the{" "}
            <span className="text-neutral-300 font-medium">
              Mystic Engineering Team
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
