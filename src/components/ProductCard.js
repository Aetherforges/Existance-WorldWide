"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ProductGallery from "./ProductGallery";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false);
  const { addItem } = useCart();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <Image
            src={product.images?.[0] ?? "/products/p1.svg"}
            alt={product.name}
            width={640}
            height={520}
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm uppercase tracking-[0.2em]">{product.name}</h3>
          <p className="text-white/60 text-sm">{formatCurrency(product.price)}</p>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid gap-8 md:grid-cols-2">
                <ProductGallery images={product.images ?? []} />
                <div>
                  <h2 className="font-display text-2xl tracking-[0.2em]">
                    {product.name}
                  </h2>
                  <p className="mt-3 text-white/60">
                    {product.description ?? ""}
                  </p>
                  <p className="mt-6 text-xl">{formatCurrency(product.price)}</p>
                  <button
                    type="button"
                    onClick={() => addItem(product, 1)}
                    className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
