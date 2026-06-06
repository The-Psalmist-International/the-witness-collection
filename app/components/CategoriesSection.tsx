"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export interface Category {
  title: string;
  image: string;
  link: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="relative w-full flex flex-col md:flex-row gap-0">
      {categories.map((category, index) => (
        <CategoryColumn
          key={index}
          category={category}
          isSingle={categories.length === 1}
        />
      ))}
    </section>
  );
}

function CategoryColumn({ category, isSingle }: { category: Category; isSingle: boolean }) {
  const columnRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const lastScrollTop = useRef(0);
  const lastTranslateY = useRef(0);

  useEffect(() => {
    const col = columnRef.current;
    const textEl = textRef.current;
    const bgEl = bgRef.current;
    if (!col || !textEl || !bgEl) return;

    const getScrollContainer = (el: HTMLElement | null): HTMLElement | Window => {
      if (!el) return window;
      const style = window.getComputedStyle(el);
      if (
        el.scrollHeight > el.clientHeight &&
        (style.overflowY === "auto" || style.overflowY === "scroll")
      ) {
        return el;
      }
      return getScrollContainer(el.parentElement);
    };

    const container = getScrollContainer(col);

    const update = () => {
      if (!col || !textEl || !bgEl) return;

      let containerHeight = 0;

      if (container === window) {
        containerHeight = window.innerHeight;
      } else {
        containerHeight = (container as HTMLElement).clientHeight;
      }

      const colRect = col.getBoundingClientRect();
      const containerRect =
        container === window
          ? { top: 0 }
          : (container as HTMLElement).getBoundingClientRect();

      const colTopInViewport = colRect.top - containerRect.top;

      bgEl.style.position = "sticky";

      if (colTopInViewport <= 0) {
        const scrolledDistance = -colTopInViewport;
        const maxScroll = colRect.height - containerHeight;
        const activeScroll = Math.min(Math.max(scrolledDistance, 0), maxScroll);


        const nextY = activeScroll * 0.5;
        textEl.style.transform = `translateY(${nextY}px)`;
      } else {
        textEl.style.transform = `translateY(0px)`;
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    };

    const target = container === window ? window : (container as HTMLElement);
    target.addEventListener("scroll", handleScroll, { passive: true });
    update();
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(rafId.current);
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  const colWidthClass = isSingle ? "w-full" : "w-full md:w-1/2";

  return (
    <div
      ref={columnRef}
      className={`relative ${colWidthClass} h-[200vh] md:h-[220vh] group`}
    >
      <div
        ref={bgRef}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden"
      >
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover transition-transform duration-1000 can-hover:group-hover:scale-105 active:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div
          ref={textRef}
          className="absolute top-0 left-0 w-full p-8 md:p-12 lg:p-16 z-10 flex flex-col items-start text-left"
          style={{ willChange: "transform" }}
        >
          <motion.h3
            className="text-white text-3xl md:text-5xl lg:text-7xl font-normal tracking-tight mb-6 drop-shadow-md"
            initial={{ opacity: 1, filter: "blur(24px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {category.title}
          </motion.h3>

          <Link
            href={category.link}
            className="inline-flex items-center gap-1 group/btn"
          >
            <span className="pressable px-6 py-3 bg-white text-black rounded-full text-sm font-semibold transition-all duration-300 ring-0 ring-white/30 hover:bg-gray-100 active:bg-gray-200 can-hover:group-hover/btn:ring-2">
              Shop now
            </span>
            <span className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-all duration-300 ring-0 ring-white/30 hover:bg-gray-100 active:bg-gray-200 can-hover:group-hover/btn:ring-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="19" x2="19" y2="5"></line>
                <polyline points="9 5 19 5 19 15"></polyline>
              </svg>
            </span>
          </Link>
        </div>
      </div>


      <div className="h-[100vh] md:h-[120vh]" />
    </div>
  );
}

