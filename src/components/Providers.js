"use client";

import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import PageTransition from "./PageTransition";
import CartDrawer from "./CartDrawer";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <PageTransition>{children}</PageTransition>
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  );
}
