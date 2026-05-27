"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard, type Product } from "./ProductCard";

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Bonjour Cable Sweater",
    price: "GHS 358",
    image: "/EOSR1048.jpg",
    hoverImage: "/EOSR1179.jpg",
    tag: "Most Wanted",
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: "2",
    name: "Blow Up Tee",
    price: "GHS 323",
    image: "/EOSR1055.jpg",
    hoverImage: "/EOSR1279.jpg",
    tag: "Most Wanted",
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: "3",
    name: "Classic Mystic Tee",
    price: "GHS 384",
    image: "/EOSR1067.jpg",
    hoverImage: "/EOSR1255.jpg",
    tag: "Most Wanted",
    sizes: ['1L', '2L'],
  },
  {
    id: "4",
    name: "The Lamb Tee",
    price: "GHS 253",
    image: "/LambWhite.png",
    hoverImage: "/EOSR1120.jpg",
    tag: "Most Wanted",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};



export function ProductsSection() {
  return (
    <section className="w-full bg-white text-black py-16 md:py-24 px-6 md:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 w-full"
        >
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 md:mt-24"
        >
          <Link
            href="/shop"
            className="text-xs md:text-sm font-medium text-black  pb-1 hover:opacity-60 transition-opacity tracking-wide uppercase"
          >
            View All
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
