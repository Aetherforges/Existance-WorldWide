import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createUniqueOrderNumber } from "../../../../lib/orderNumber";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminSupabase() {
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
    const { customer, order, items } = body;

    const supabase = getAdminSupabase();

    let customerId = null;
    if (customer?.email) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("email", customer.email)
        .maybeSingle();

      if (existing?.id) {
        customerId = existing.id;
      } else {
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({ email: customer.email })
          .select("id")
          .single();
        customerId = newCustomer?.id;
      }
    }

    const orderNumber =
      order?.order_number || (await createUniqueOrderNumber(supabase));
    const { data: createdOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        order_number: orderNumber,
        total: order.total,
        status: order.status,
        delivery_method: order.delivery_method,
        shipping_name: order.shipping_name,
        phone: order.phone,
        address: order.address,
      })
      .select("id,order_number")
      .single();

    if (orderError) {
      return NextResponse.json({ message: orderError.message }, { status: 400 });
    }

    const orderItems = items.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.id,
      quantity: item.quantity,
    }));
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json({ message: itemsError.message }, { status: 400 });
    }

    await Promise.all(
      items.map((item) =>
        supabase
          .from("products")
          .update({
            stock: Math.max(0, (item.stock ?? 0) - item.quantity),
          })
          .eq("id", item.id)
      )
    );

    return NextResponse.json({
      id: createdOrder.id,
      order_number: createdOrder.order_number,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
