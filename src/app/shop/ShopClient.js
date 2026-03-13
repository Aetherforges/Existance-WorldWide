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
            <h1 className="font-display text-3xl tracking-[0.25em]">
              The Noir Series
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
      </div>
    </div>
  );
}
