import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createUniqueOrderNumber } from "../../../../lib/orderNumber";
import { calculateTierPrice } from "../../../../lib/pricing";

// DB helper: admin Supabase client for server-side writes
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

// Route handler: POST /app/api/order/create
export async function POST(request) {
  try {
    const body = await request.json();
    const items = body?.items ?? [];
    const customer = body?.customer ?? {};
    const shipping = body?.shipping ?? {};
    const deliveryMethod = body?.delivery_method ?? "";
    const deliveryOption = body?.delivery_option ?? "";

    // Validation: required fields
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are required." },
        { status: 400 }
      );
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.address) {
      return NextResponse.json(
        { success: false, message: "Shipping name, phone, and address are required." },
        { status: 400 }
      );
    }
    if (!deliveryMethod) {
      return NextResponse.json(
        { success: false, message: "Delivery method is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const productIds = items.map((item) => item.product_id);

    // Fetch product snapshot for pricing + stock validation
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id,name,price,retail_price,regular_price,wholesale_price,bulk_price,regular_min_qty,wholesale_min_qty,bulk_min_qty,stock"
      )
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json(
        { success: false, message: productsError.message },
        { status: 500 }
      );
    }
    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more products not found." },
        { status: 404 }
      );
    }

    // Stock checks + totals
    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = 0;
    for (const item of items) {
      const product = productMap.get(item.product_id);
      const qty = Number(item.quantity || 0);
      if (!product || qty <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid item quantity." },
          { status: 400 }
        );
      }
      if ((product.stock ?? 0) < qty) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}.` },
          { status: 409 }
        );
      }
      const { price } = calculateTierPrice(product, qty);
      total += Number(price) * qty;
    }

    // Create unique order number
    const orderNumber = await createUniqueOrderNumber(supabase);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        total,
        shipping_name: shipping.name,
        phone: shipping.phone,
        address: shipping.address,
        delivery_method: deliveryMethod,
        delivery_option: deliveryOption || null,
        customer_id: customer?.id || null,
      })
      .select("id,order_number")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: orderError?.message || "Order creation failed." },
        { status: 500 }
      );
    }

    // Insert order items with snapshot name/price
    const orderItems = items.map((item) => {
      const product = productMap.get(item.product_id);
      const { price } = calculateTierPrice(product, Number(item.quantity));
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: product.name,
        quantity: Number(item.quantity),
        price: Number(price),
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { success: false, message: itemsError.message },
        { status: 500 }
      );
    }

    // Deduct stock (with safety check)
    for (const item of orderItems) {
      const { data: updated } = await supabase
        .from("products")
        .update({
          stock: Math.max(0, (productMap.get(item.product_id)?.stock ?? 0) - item.quantity),
        })
        .eq("id", item.product_id)
        .gte("stock", item.quantity)
        .select("id")
        .maybeSingle();

      if (!updated?.id) {
        await supabase.from("order_items").delete().eq("order_id", order.id);
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          { success: false, message: "Stock updated failed. Please retry." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      summary: {
        order_number: order.order_number,
        items: orderItems,
        total,
        delivery_method: deliveryMethod,
        delivery_option: deliveryOption,
        customer: {
          id: customer?.id || null,
          name: shipping.name,
          email: customer?.email || null,
          phone: shipping.phone,
          address: shipping.address,
        },
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error." },
      { status: 500 }
    );
  }
}
