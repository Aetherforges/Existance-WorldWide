"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateTierPrice } from "../lib/pricing";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("eww-cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      window.localStorage.removeItem("eww-cart");
      return;
    }
    window.localStorage.setItem("eww-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    if (product?.stock === 0) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => {
          if (item.id !== product.id) return item;
          const nextQty = item.quantity + quantity;
          const { price } = calculateTierPrice(
            { ...item, ...product },
            nextQty
          );
          return { ...item, ...product, quantity: nextQty, price };
        });
      }
      const { price } = calculateTierPrice(product, quantity);
      return [...prev, { ...product, quantity, price }];
    });
    setIsOpen(true);
  };

  const updateQuantity = (id, quantity) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = Math.max(1, quantity);
          const { price } = calculateTierPrice(item, nextQty);
          return { ...item, quantity: nextQty, price };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = {
    items,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
