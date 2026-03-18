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
    if (open) setQuantity(1);
  }, [open]);

  return (
    <>
      <motion.div
        className="rounded-xl border border-white/10 bg-[#111111] p-4 shadow-md"
        whileHover={{ y: -4 }}
      >
        {/* CLICKABLE PRODUCT */}
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
              className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="mt-4 space-y-1">
            <h3 className="text-sm uppercase tracking-[0.2em]">
              {product.name}
            </h3>
            <p className="text-white/60 text-sm">
              {formatCurrency(displayPrice)}
            </p>
          </div>
        </button>

        {/* ✅ QUANTITY INPUT (NEW) */}
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value || 1)))
          }
          className="mt-3 w-full rounded-full bg-black px-3 py-2 text-sm text-white ring-1 ring-white/20"
        />

        {/* ✅ BUTTONS */}
        <div className="mt-3 flex gap-2">
          {/* ADD TO CART */}
          <button
            ref={addButtonRef}
            onClick={() => {
              addItem(product, quantity);
              const rect = addButtonRef.current.getBoundingClientRect();
              setFly({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              });
            }}
            className="flex-1 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black"
          >
            Add
          </button>

          {/* PRE ORDER */}
          <button
            onClick={() =>
              addItem({ ...product, preorder: true }, quantity)
            }
            className="flex-1 rounded-full border border-white px-4 py-2 text-xs uppercase tracking-[0.3em]"
          >
            Pre Order
          </button>
        </div>
      </motion.div>

      {/* 🔥 MODAL */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid gap-8 md:grid-cols-2">
                <ProductGallery images={product.images ?? []} />

                <div>
                  <h2 className="text-2xl tracking-[0.2em]">
                    {product.name}
                  </h2>

                  <p className="mt-3 text-white/60">
                    {product.description}
                  </p>

                  <p className="mt-6 text-xl">
                    {formatCurrency(pricing.price)}
                  </p>

                  {/* QUANTITY */}
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Number(e.target.value || 1))
                      )
                    }
                    className="mt-4 w-full rounded-full bg-black px-3 py-2 text-white ring-1 ring-white/20"
                  />

                  {/* BUTTONS */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => addItem(product, quantity)}
                      className="flex-1 rounded-full bg-white px-6 py-3 text-sm uppercase text-black"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() =>
                        addItem({ ...product, preorder: true }, quantity)
                      }
                      className="flex-1 rounded-full border border-white px-6 py-3 text-sm uppercase"
                    >
                      Pre-Order
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLY EFFECT */}
      <AnimatePresence>
        {fly && (
          <motion.div
            className="pointer-events-none fixed z-50 h-3 w-3 rounded-full bg-white"
            initial={{ left: fly.x, top: fly.y }}
            animate={{ left: "90vw", top: "6vh", opacity: 0 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => setFly(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}