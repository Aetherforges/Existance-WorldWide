"use client";

import Link from "next/link";
import { ShoppingCart, UserRound, LogIn, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { items, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const categories = ["Boxers", "Earrings", "Accessories"];

  return (
    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/shop"
          className="font-display text-xl tracking-[0.2em] sm:text-3xl sm:tracking-[0.3em] lg:text-5xl lg:tracking-[0.4em]"
        >
          EXIST WORLD WIDE
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.15em] sm:gap-6 sm:text-sm sm:tracking-[0.2em]">
          <div className="group relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:text-white/70"
            >
              Categories
              <ChevronDown size={16} />
            </button>
            <div
              className={`${
                menuOpen ? "block" : "hidden"
              } absolute left-0 top-full w-56 rounded-2xl border border-white/10 bg-[#111111] p-3 text-xs uppercase tracking-[0.25em] shadow-2xl sm:group-hover:block`}
            >
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/shop?category=${encodeURIComponent(category)}`}
                  className="block rounded-lg px-3 py-2 hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/login" className="flex items-center gap-2 hover:text-white/70">
            <LogIn size={18} />
            Login
          </Link>
          <Link href="/account" className="flex items-center gap-2 hover:text-white/70">
            <UserRound size={18} />
            Account
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 hover:text-white/70"
            aria-label="Open cart"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-3 rounded-full bg-white px-2 py-0.5 text-xs text-black">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
