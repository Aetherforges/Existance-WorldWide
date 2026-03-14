import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: "Order number is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const selectFields =
      "id,order_number,total,status,delivery_method,delivery_option,tracking_number,created_at,shipping_name,phone,address,order_items(quantity,product_name,price,products(name,price))";

    let { data, error } = await supabase
      .from("orders")
      .select(selectFields)
      .ilike("order_number", orderNumber)
      .maybeSingle();

    if (!data && !error) {
      const fallback = await supabase
        .from("orders")
        .select(selectFields)
        .eq("id", orderNumber)
        .maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error." },
      { status: 500 }
    );
  }
}
