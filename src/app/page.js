"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const title = "EXIST WORLD WIDE";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="text-center">
        <motion.h1
          className="font-display text-3xl tracking-[0.35em] text-white sm:text-4xl sm:tracking-[0.5em] md:text-6xl md:tracking-[0.6em]"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.25)" }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
        >
          {title.split("").map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.4, ease: "easeOut" },
                },
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.button
          type="button"
          onClick={() => router.push("/shop")}
          className="glow-button mt-10 rounded-full bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Shop Now
        </motion.button>
      </div>
    </div>
  );
}
