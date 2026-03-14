import "./globals.css";
import { Playfair_Display, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "../components/Providers";
import Footer from "../components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "EXIST WORLD WIDE",
  description: "Luxury minimal ecommerce experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${manrope.variable} bg-black text-white`}>
        <Providers>
          {children}
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
