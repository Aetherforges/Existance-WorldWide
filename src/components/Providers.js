"use client";

import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import PageTransition from "./PageTransition";
import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });

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
