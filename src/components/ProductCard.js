"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { formatCurrency, resolveImageUrl } from "../lib/format";
import { calculateTierPrice, getTierConfig } from "../lib/pricing";

const ProductGallery = dynamic(() => import("./ProductGallery"), {
  ssr: false,
});

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false);
  const [fly, setFly] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const addButtonRef = useRef(null);
  const tierConfig = getTierConfig(product);
  const pricing = calculateTierPrice(product, quantity);
  const displayPrice = calculateTierPrice(product, 1).price;

  useEffect(() => {
    if (open) {
      setQuantity(1);
    }
  }, [open]);

  return (
    <>
      <motion.div
        className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-md"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group w-full text-left"
        >
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src={resolveImageUrl(product.images?.[0]) || "/products/p1.svg"}
              alt={product.name}
              width={640}
              height={520}
              quality={75}
              className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            />
            {product.stock === 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-black">
                Out of Stock
              </span>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-sm uppercase tracking-[0.2em]">{product.name}</h3>
            <p className="text-white/60 text-sm">
              {formatCurrency(displayPrice)}
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={product.stock === 0}
          ref={addButtonRef}
          onClick={() => {
            addItem(product, 1);
            if (addButtonRef.current) {
              const rect = addButtonRef.current.getBoundingClientRect();
              setFly({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              });
            }
          }}
          className={`mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
            product.stock === 0
              ? "cursor-not-allowed bg-white/10 text-white/40"
              : "bg-white text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          }`}
        >
          Add To Cart
        </button>
      </motion.div>

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
                  <p className="mt-6 text-xl">
                    {formatCurrency(pricing.price)}{" "}
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                      {pricing.tier} price
                    </span>
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(Math.max(1, Number(event.target.value || 1)))
                      }
                      className="w-24 rounded-full bg-black px-3 py-2 text-sm text-white ring-1 ring-white/20"
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Pricing
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Retail</span>
                        <span>{formatCurrency(tierConfig.retail)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Regular ({tierConfig.regularMin}+)</span>
                        <span>{formatCurrency(tierConfig.regular)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Wholesale ({tierConfig.wholesaleMin}+)</span>
                        <span>{formatCurrency(tierConfig.wholesale)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bulk ({tierConfig.bulkMin}+)</span>
                        <span>{formatCurrency(tierConfig.bulk)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={() => addItem(product, quantity)}
                    className={`mt-8 rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition ${
                      product.stock === 0
                        ? "cursor-not-allowed bg-white/10 text-white/40"
                        : "bg-white text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                    }`}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add To Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fly && (
          <motion.div
            className="pointer-events-none fixed z-50 h-3 w-3 rounded-full bg-white"
            initial={{ opacity: 1, scale: 1, left: fly.x, top: fly.y }}
            animate={{ opacity: 0, scale: 0.2, left: "90vw", top: "6vh" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => setFly(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
