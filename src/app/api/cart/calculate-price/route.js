import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateTierPrice } from "../../../../lib/pricing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const productId = body?.productId;
    const quantity = Number(body?.quantity ?? 1);

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id,retail_price,regular_price,wholesale_price,bulk_price,regular_min_qty,wholesale_min_qty,bulk_min_qty,price"
      )
      .eq("id", productId)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const { price, tier } = calculateTierPrice(product, quantity);
    return NextResponse.json({
      success: true,
      price_per_unit: price,
      tier,
      total: price * Math.max(1, quantity),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error." },
      { status: 500 }
    );
  }
}
