"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    question: "How does the pre-order process work?",
    answer: "When you pre-order an item, you secure it before it's officially in stock. Your payment method will be charged at the time of purchase, and the item will ship as soon as it becomes available."
  },
  {
    question: "What payment options are available?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All transactions are securely processed."
  },
  {
    question: "Can I change or cancel my order?",
    answer: "If you need to change or cancel your order, please contact us immediately. Once an order has been processed or shipped, we are unable to modify it."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days within the country. International shipping may take 7-14 business days depending on the destination."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 30-day return policy for unused items in their original packaging. Exchanges can be made for different sizes or colors, subject to availability."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary based on your location and will be calculated at checkout."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-white text-black py-20 md:py-32 px-6 md:px-10 lg:px-12 border-t border-gray-100 text-left">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24">

        <div className="w-full md:w-1/3 flex flex-col justify-start">
          <div className="relative ml-0 md:ml-6">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-normal tracking-tight leading-[1.1]">
              Frequently<br />
              asked<br />
              questions
            </h2>
          </div>
        </div>


        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex flex-col w-full">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              const number = String(index + 1).padStart(2, '0');

              return (
                <div key={index} className="border-b border-gray-100 py-6 first:pt-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-base md:text-lg font-light transition-colors duration-300 ${isOpen ? 'text-[#3b0764]' : 'text-[#9ca3af]'}`}>
                        {number}.
                      </span>
                      <span className={`text-base md:text-lg font-light transition-colors duration-300 ${isOpen ? 'text-[#3b0764]' : 'text-[#9ca3af] group-hover:text-gray-700'}`}>
                        {faq.question}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pl-10 pr-4 text-[15px] text-[#a1a1aa] font-light leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-16 md:mt-24 pt-4 text-left">
            <p className="text-base font-medium text-black">
              Can't find your answers here ? <a href="#" className="underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity">Get in touch</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
