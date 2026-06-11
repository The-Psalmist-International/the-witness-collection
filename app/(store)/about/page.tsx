"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PromoBanner, HeaderContent } from "@/app/components/Navbar";
import { FooterSection } from "@/app/components/FooterSection";

export default function AboutPage() {
  const [activeOffer, setActiveOffer] = useState("Apparel");

  const offers = [
    { id: "Apparel", image: "/EOSR1279.jpg" },
    { id: "Apothecary", image: "/healthy-product-olive-oil.jpg" },
    { id: "Books & Study Materials", image: "/holy-communion-concept-with-bible.jpg" },
    { id: "Accessories", image: "/EOSR1048.jpg" }
  ];

  const currentOfferImage = offers.find(o => o.id === activeOffer)?.image || offers[0].image;

  return (
    <main className="flex-1 bg-white w-full min-h-screen text-black overflow-x-hidden">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <PromoBanner />
        <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full">
          <HeaderContent />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-24 space-y-32 md:space-y-48">

        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-2xl"
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">(Our Manifesto)</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
              We are not simply a store. We are a ministry of presence.
            </h1>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 w-full">
            <motion.div
              className="w-full md:w-1/4 aspect-[3/4] relative rounded-lg overflow-hidden bg-fuchsia-500 shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Image src="/EOSR1067.jpg" alt="Manifesto 1" fill className="object-cover" />
            </motion.div>

            <motion.div
              className="w-full md:w-2/4 aspect-[16/10] relative rounded-lg overflow-hidden bg-purple-900 mt-8 md:mt-24 lg:mt-32 shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Image src="/EOSR1179.jpg" alt="Manifesto 2" fill className="object-cover" />
            </motion.div>

            <motion.div
              className="w-full md:w-1/4 aspect-[3/4] relative rounded-lg overflow-hidden bg-fuchsia-500 shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image src="/EOSR1243.jpg" alt="Manifesto 3" fill className="object-cover" />
            </motion.div>
          </div>
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl"
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">(Who We Are)</p>
            <p className="text-base md:text-lg font-medium leading-relaxed">
              The Witness Collection is the official merchandise and resource department of The Martyrs Church,
              under The Psalmist International. We exist at the intersection of faith and everyday life — curating
              artifacts, apparel, and resources that carry the weight of the Gospel into every space you occupy.
            </p>
          </motion.div>
        </section>

        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl"
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">(What We Stand For)</p>
            <p className="text-base md:text-lg font-medium leading-relaxed">
              Every piece in The Witness Collection is intentional. From the garment you wear to the oil you anoint
              with, from the book in your hand to the cap on your head — everything we carry is designed to help you
              represent Christ accurately, boldly, and beautifully in your world. We believe that witness is not
              confined to the pulpit; it lives in what you wear, what you carry, and what you give to others. The
              Witness Collection exists to resource that witness — for the believer in the church and for anyone
              ready to carry something greater than themselves.
            </p>
          </motion.div>

          <motion.div
            className="w-full relative h-[300px] md:h-[500px] rounded-lg overflow-hidden bg-fuchsia-500"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/EOSR1312.jpg" alt="What we stand for" fill className="object-cover" />
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-10">(What We Offer)</p>
            <ul className="space-y-6">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  role="button"
                  tabIndex={0}
                  className={`pressable cursor-pointer text-2xl font-medium transition-colors duration-300 md:text-4xl ${
                    activeOffer === offer.id
                      ? "text-black"
                      : "text-gray-300 hover:text-gray-500 active:text-gray-600"
                  }`}
                  onClick={() => setActiveOffer(offer.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveOffer(offer.id);
                    }
                  }}
                  onMouseEnter={() => setActiveOffer(offer.id)}
                >
                  {offer.id}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="relative w-full aspect-square md:w-[400px] md:h-[400px] rounded-lg overflow-hidden bg-fuchsia-500 justify-self-center md:justify-self-end"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Image
              key={currentOfferImage}
              src={currentOfferImage}
              alt={activeOffer}
              fill
              className="object-cover"
            />
          </motion.div>
        </section>
      </div>


      <section className="relative w-full h-screen sticky top-0 flex items-center justify-center overflow-hidden">

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://cdn.coverr.co/videos/coverr-a-person-praying-in-the-dark-4428/1080p.mp4" type="video/mp4" />
        </video>


        <div className="absolute inset-0 bg-[#f400e9]/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/30" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[10px] md:text-xs uppercase tracking-widest mb-6">(Our Covering)</p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium leading-tight">
            The Witness Collection operates under The Martyrs Church, a subset of The Psalmist International — an Apostolic Christian movement commissioned to bring the complete witness of God to the nations.
          </h2>
        </motion.div>
      </section>

      <div className="relative z-20 bg-white">
        <FooterSection />
      </div>
    </main>
  );
}
