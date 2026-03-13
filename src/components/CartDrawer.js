"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency, resolveImageUrl } from "../lib/format";
import Link from "next/link";

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#111111] border-l border-white/10 p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg uppercase tracking-[0.25em]">Your Cart</h2>
              <button onClick={closeCart} aria-label="Close cart">
                <X />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {items.length === 0 && (
                <p className="text-white/60">Your cart is empty.</p>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Image
                    src={resolveImageUrl(item.images?.[0] ?? item.image)}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg border border-white/10 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm uppercase tracking-[0.15em]">
                        {item.name}
                      </h3>
                      <button onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-white/60 text-sm">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        className="rounded-full border border-white/20 p-1"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(item.id, Number(event.target.value || 1))
                        }
                        className="w-16 rounded-full bg-black px-3 py-1 text-center text-sm text-white ring-1 ring-white/20"
                      />
                      <button
                        className="rounded-full border border-white/20 p-1"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-6 block rounded-full bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              >
                Checkout
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
