"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabaseClient";
import { sampleProducts } from "../../lib/sampleProducts";

export default function ShopClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    let active = true;
    async function load() {
      let query = supabase
        .from("products")
        .select("id,name,description,price,images,category,stock")
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (!active) return;
      if (error || !data) {
        setProducts(sampleProducts);
      } else {
        const fallback = category
          ? sampleProducts.filter((item) => item.category === category)
          : sampleProducts;
        setProducts(data.length ? data : fallback);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [category]);

  return (
    <div className="page-shell">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Collection
            </p>
            <h1 className="font-display text-2xl tracking-[0.18em] md:text-3xl md:tracking-[0.25em]">
              Elevate your existence
            </h1>
          </div>
          <p className="text-sm text-white/60">
            {loading
              ? "Loading"
              : `${products.length} piece${products.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="mt-8 text-sm text-white/60">
            There are no Existing Products in this page for now.
          </p>
        )}

        <div className="mt-16 rounded-3xl border border-white/10 bg-[#111111] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Reseller Community
          </p>
          <h2 className="mt-3 font-display text-2xl tracking-[0.2em]">
            Join the Exist WorldWide Network
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Connect with fellow resellers and get priority updates.
          </p>
          <a
            href="https://t.me/+8NjXVOkaADwyNGI1"
            target="_blank"
            rel="noreferrer"
            className="glow-button mt-6 inline-flex rounded-full bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          >
            Join the Community
          </a>
        </div>
      </div>
    </div>
  );
}
