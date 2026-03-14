"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { formatCurrency, resolveImageUrl } from "../../../lib/format";

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
  "Earrings",
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
  const [form, setForm] = useState(emptyProduct);
  const [files, setFiles] = useState([]);
  const [localPreviews, setLocalPreviews] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bulkStocks, setBulkStocks] = useState({});
  const [bulkPrices, setBulkPrices] = useState({});
  const [bulkCosts, setBulkCosts] = useState({});

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setBulkStocks((prev) => {
      const next = { ...prev };
      (data ?? []).forEach((product) => {
        if (next[product.id] === undefined || next[product.id] === null) {
          next[product.id] = product.stock ?? 0;
        }
      });
      return next;
    });
    setBulkPrices((prev) => {
      const next = { ...prev };
      (data ?? []).forEach((product) => {
        if (next[product.id] === undefined || next[product.id] === null) {
          next[product.id] = product.price ?? 0;
        }
      });
      return next;
    });
    setBulkCosts((prev) => {
      const next = { ...prev };
      (data ?? []).forEach((product) => {
        if (next[product.id] === undefined || next[product.id] === null) {
          next[product.id] = product.cost ?? 0;
        }
      });
      return next;
    });
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!files || Array.from(files).length === 0) {
      setLocalPreviews([]);
      return;
    }

    const previews = Array.from(files)
      .slice(0, 5)
      .map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));

    setLocalPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

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
        if (error) {
          throw new Error(error.message);
        }
        const { data } = bucket.getPublicUrl(filename);
        return data.publicUrl;
      })
    );

    return uploads.filter(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!files.length && (!form.images || form.images.length === 0)) {
      setError("Please upload at least one product image.");
      setLoading(false);
      return;
    }

    let uploaded = [];
    try {
      uploaded = await uploadImages();
    } catch (err) {
      setError(err.message ?? "Image upload failed.");
      setLoading(false);
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      cost: Number(form.cost),
      category: form.category,
      stock: Number(form.stock),
      images: uploaded.length ? uploaded : form.images,
    };

    try {
      if (form.id) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", form.id)
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        setProducts((prev) =>
          prev.map((item) => (item.id === data.id ? data : item))
        );
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        setProducts((prev) => [data, ...prev]);
      }
    } catch (err) {
      setError(err.message ?? "Unable to save product.");
    }

    setForm(emptyProduct);
    setFiles([]);
    setFileInputKey((prev) => prev + 1);
    await fetchProducts();
    setLoading(false);
  }

  function handleEdit(product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost,
      category: product.category,
      stock: product.stock,
      images: product.images ?? [],
    });
    setFiles([]);
    setFileInputKey((prev) => prev + 1);
  }

  async function handleDelete(id) {
    setError("");
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setError(error.message ?? "Delete failed");
      return;
    }
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleBulkSave() {
    setError("");
    const updates = products
      .map((product) => ({
        id: product.id,
        stock: Number(bulkStocks[product.id]),
        price: Number(bulkPrices[product.id]),
        cost: Number(bulkCosts[product.id]),
        current: product.stock ?? 0,
        currentPrice: product.price ?? 0,
        currentCost: product.cost ?? 0,
      }))
      .filter((item) => {
        const stockChanged =
          Number.isFinite(item.stock) && item.stock !== item.current;
        const priceChanged =
          Number.isFinite(item.price) && item.price !== item.currentPrice;
        const costChanged =
          Number.isFinite(item.cost) && item.cost !== item.currentCost;
        return stockChanged || priceChanged || costChanged;
      });

    if (updates.length === 0) {
      setError("No bulk changes to save.");
      return;
    }

    try {
      await Promise.all(
        updates.map((item) =>
          supabase
            .from("products")
            .update({
              stock: Number.isFinite(item.stock) ? item.stock : item.current,
              price: Number.isFinite(item.price) ? item.price : item.currentPrice,
              cost: Number.isFinite(item.cost) ? item.cost : item.currentCost,
            })
            .eq("id", item.id)
        )
      );
      await fetchProducts();
    } catch (err) {
      setError(err.message ?? "Bulk update failed.");
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Inventory</p>
        <h1 className="font-display text-3xl tracking-[0.2em]">Product Management</h1>
        <button
          type="button"
          onClick={fetchProducts}
          className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em]"
        >
          Refresh
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}

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
            key={fileInputKey}
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
            className="mt-2 w-full max-w-xs text-xs text-white/60"
          />
          <p className="mt-2 text-xs text-white/40">
            Up to 5 images. Uploading here saves to the `product-images` bucket and
            stores the public URL automatically.
          </p>
        </div>

        {(form.images?.length > 0 || localPreviews.length > 0) && (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Preview</p>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {(form.images ?? []).slice(0, 5).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black"
                  title="Existing image"
                >
                  <img
                    src={resolveImageUrl(image)}
                    alt="Existing product"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-black">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {localPreviews.map((preview, index) => (
                <div
                  key={preview.url}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black"
                  title={preview.name}
                >
                  <img
                    src={preview.url}
                    alt="Selected upload"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-black">
                    New
                  </span>
                  {index === 0 && (form.images?.length ?? 0) === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-black">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
            {form.id && localPreviews.length > 0 && (
              <p className="mt-2 text-xs text-white/40">
                New uploads will replace the current gallery when you update.
              </p>
            )}
          </div>
        )}

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
              onClick={() => {
                setForm(emptyProduct);
                setFiles([]);
                setFileInputKey((prev) => prev + 1);
              }}
              className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.4em]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {products.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Inventory
              </p>
              <h2 className="font-display text-2xl tracking-[0.2em]">
                Bulk Stock & Price Update
              </h2>
            </div>
            <button
              type="button"
              onClick={handleBulkSave}
              className="glow-button rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black"
            >
              Save All Changes
            </button>
          </div>
          <p className="mt-3 text-xs text-white/50">
            Update multiple product stocks, prices, and costs at once. Only changed values are saved.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.3em] text-white/60">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Current</th>
                  <th className="px-4 py-3">New Stock</th>
                  <th className="px-4 py-3">Current Price</th>
                  <th className="px-4 py-3">New Price</th>
                  <th className="px-4 py-3">Current Cost</th>
                  <th className="px-4 py-3">New Cost</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={bulkStocks[product.id] ?? ""}
                        onChange={(event) =>
                          setBulkStocks((prev) => ({
                            ...prev,
                            [product.id]: event.target.value,
                          }))
                        }
                        className="w-28 rounded-full bg-black px-3 py-2 text-sm text-white ring-1 ring-white/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(product.price ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bulkPrices[product.id] ?? ""}
                        onChange={(event) =>
                          setBulkPrices((prev) => ({
                            ...prev,
                            [product.id]: event.target.value,
                          }))
                        }
                        className="w-32 rounded-full bg-black px-3 py-2 text-sm text-white ring-1 ring-white/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(product.cost ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bulkCosts[product.id] ?? ""}
                        onChange={(event) =>
                          setBulkCosts((prev) => ({
                            ...prev,
                            [product.id]: event.target.value,
                          }))
                        }
                        className="w-32 rounded-full bg-black px-3 py-2 text-sm text-white ring-1 ring-white/20"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {products.map((product) => (
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
        {products.length === 0 && (
          <p className="text-sm text-white/60">No products yet.</p>
        )}
      </div>
    </div>
  );
}
