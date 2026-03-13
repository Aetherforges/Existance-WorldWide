export function formatCurrency(amount, currency = "PHP") {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function resolveImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("/") || image.startsWith("data:")) return image;
  if (image.startsWith("http")) return image;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return image;
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = image.replace(/^\//, "");
  return `${cleanBase}/storage/v1/object/public/product-images/${cleanPath}`;
}
