"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabaseClient";
import { sampleProducts } from "../../lib/sampleProducts";

export default function ShopClient() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    let active = true;
    async function load() {
      const query = supabase
        .from("products")
        .select("id,name,description,price,images,category,stock")
        .order("created_at", { ascending: false });
      const { data, error } = await query;

      if (!active) return;
      if (error || !data) {
        setAllProducts(sampleProducts);
      } else {
        setAllProducts(data.length ? data : sampleProducts);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (!category) return allProducts;
    return allProducts.filter((item) => item.category === category);
  }, [allProducts, category]);

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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full flex justify-center">
              <p className="text-center text-sm text-white/60">
                No Items are currently Existing in this filter
              </p>
            </div>
          )}
        </div>

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
