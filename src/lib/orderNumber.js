export function generateOrderNumber(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createUniqueOrderNumber(supabase, maxTries = 6) {
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    const candidate = generateOrderNumber(8);
    const { data } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", candidate)
      .maybeSingle();
    if (!data) {
      return candidate;
    }
  }
  throw new Error("Unable to generate a unique order number.");
}
