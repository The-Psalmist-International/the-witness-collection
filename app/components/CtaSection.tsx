"use client";

import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="w-full bg-[#3b0764] text-white py-16 md:py-30 px-6 md:px-10 lg:px-12 relative overflow-hidden text-left flex-shrink-0">
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          <filter id="noiseFilterCta">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterCta)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-16 relative z-10">


        <motion.div
          className="flex flex-col max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[10px] md:text-xs  uppercase tracking-widest mb-4 md:mb-6 opacity-80">
            ALL ITEMS ON PRE-ORDER.
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
            Secure your limited edition items today with our exclusive pre-order system.
          </h2>
        </motion.div>


        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 shrink-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <button className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group">
            Shop now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <button className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 group">
            Contact sales
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
