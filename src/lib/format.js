export function formatCurrency(amount, currency = "PHP") {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
