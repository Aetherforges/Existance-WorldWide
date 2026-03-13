/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { formatCurrency } from "../../../lib/format";
import { sampleProducts } from "../../../lib/sampleProducts";

const emptyProduct = {
  id: null,
  name: "",
  description: "",
  price: "",
  cost: "",
  category: "",
  stock: "",
  images: [],
};

const categories = [
  "Boxers",
  "Earrings Bundle",
  "Perfumes",
  "Dress",
  "Skirts",
  "Pods",
  "Watch",
  "Tanktops",
  "Close Caps",
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [defaultProducts, setDefaultProducts] = useState(sampleProducts);
  const [form, setForm] = useState(emptyProduct);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDefaultId, setEditingDefaultId] = useState(null);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const mergedProducts = useMemo(
    () => [...products, ...defaultProducts],
    [products, defaultProducts]
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function uploadImages() {
    if (!files.length) return [];

    const bucket = supabase.storage.from("product-images");
    const uploads = await Promise.all(
      Array.from(files).slice(0, 5).map(async (file) => {
        const filename = `${crypto.randomUUID()}-${file.name}`;
        const { error } = await bucket.upload(filename, file);
        if (error) return null;
        const { data } = bucket.getPublicUrl(filename);
        return data.publicUrl;
      })
    );

    return uploads.filter(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    const uploaded = await uploadImages();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      cost: Number(form.cost),
      category: form.category,
      stock: Number(form.stock),
      images: uploaded.length ? uploaded : form.images,
    };

    if (editingDefaultId) {
      await supabase.from("products").insert(payload);
      setDefaultProducts((prev) =>
        prev.filter((item) => item.id !== editingDefaultId)
      );
      setEditingDefaultId(null);
    } else if (form.id) {
      await supabase.from("products").update(payload).eq("id", form.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setForm(emptyProduct);
    setFiles([]);
    await fetchProducts();
    setLoading(false);
  }

  function handleEdit(product) {
    setForm({
      id: defaultProducts.find((item) => item.id === product.id) ? null : product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost,
      category: product.category,
      stock: product.stock,
      images: product.images ?? [],
    });
    if (defaultProducts.find((item) => item.id === product.id)) {
      setEditingDefaultId(product.id);
    } else {
      setEditingDefaultId(null);
    }
  }

  async function handleDelete(id) {
    if (defaultProducts.find((item) => item.id === id)) {
      setDefaultProducts((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    await supabase.from("products").delete().eq("id", id);
    await fetchProducts();
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Inventory</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Product Management</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-3xl border border-white/10 bg-[#111111] p-6 md:grid-cols-2 md:p-8"
      >
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Name</label>
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Category</label>
          <select
            required
            value={form.category}
            onChange={handleChange("category")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Description</label>
          <textarea
            required
            rows="3"
            value={form.description}
            onChange={handleChange("description")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Price</label>
          <input
            type="number"
            required
            value={form.price}
            onChange={handleChange("price")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Cost</label>
          <input
            type="number"
            required
            value={form.cost}
            onChange={handleChange("cost")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Stock</label>
          <input
            type="number"
            required
            value={form.stock}
            onChange={handleChange("stock")}
            className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-white/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setFiles(event.target.files)}
            className="mt-2 w-full max-w-xs text-xs text-white/60"
          />
          <p className="mt-2 text-xs text-white/40">Up to 5 images.</p>
        </div>

        <div className="md:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="glow-button rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
          >
            {form.id ? "Update" : "Add"} Product
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyProduct)}
              className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.4em]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {mergedProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111] p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em]">{product.name}</h3>
              <p className="text-white/60 text-sm">
                {product.category || "Uncategorized"} · {formatCurrency(product.price)} · Stock {product.stock}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em]"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>
              <button
                className="rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-black"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
