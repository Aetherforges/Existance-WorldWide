export function getTierConfig(product = {}) {
  const retailBase = Number(
    product.retail_price ?? product.price ?? product.retailPrice ?? 0
  );
  const regularBase = Number(product.regular_price ?? retailBase);
  const wholesaleBase = Number(product.wholesale_price ?? regularBase);
  const bulkBase = Number(product.bulk_price ?? wholesaleBase);

  const regularMin = Number(product.regular_min_qty);
  const wholesaleMin = Number(product.wholesale_min_qty);
  const bulkMin = Number(product.bulk_min_qty);

  return {
    retail: Number.isFinite(retailBase) ? retailBase : 0,
    regular: Number.isFinite(regularBase) ? regularBase : retailBase || 0,
    wholesale: Number.isFinite(wholesaleBase) ? wholesaleBase : regularBase || 0,
    bulk: Number.isFinite(bulkBase) ? bulkBase : wholesaleBase || 0,
    regularMin: Number.isFinite(regularMin) && regularMin > 0 ? regularMin : 10,
    wholesaleMin:
      Number.isFinite(wholesaleMin) && wholesaleMin > 0 ? wholesaleMin : 50,
    bulkMin: Number.isFinite(bulkMin) && bulkMin > 0 ? bulkMin : 100,
  };
}

export function calculateTierPrice(product = {}, quantity = 1) {
  const qty = Math.max(1, Number(quantity) || 1);
  const { retail, regular, wholesale, bulk, regularMin, wholesaleMin, bulkMin } =
    getTierConfig(product);

  if (qty >= bulkMin) {
    return { price: bulk, tier: "bulk" };
  }
  if (qty >= wholesaleMin) {
    return { price: wholesale, tier: "wholesale" };
  }
  if (qty >= regularMin) {
    return { price: regular, tier: "regular" };
  }
  return { price: retail, tier: "retail" };
}
