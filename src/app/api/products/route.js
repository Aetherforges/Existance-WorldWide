import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "../../../lib/adminAuth";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,description,price,retail_price,regular_price,wholesale_price,bulk_price,regular_min_qty,wholesale_min_qty,bulk_min_qty,images,category,stock,cost"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, products: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const payload = {
      name: body?.name,
      description: body?.description,
      category: body?.category,
      images: body?.images ?? [],
      stock: Number(body?.stock ?? 0),
      cost: Number(body?.cost ?? 0),
      retail_price: Number(body?.retail_price ?? body?.price ?? 0),
      regular_price: Number(body?.regular_price ?? body?.retail_price ?? 0),
      wholesale_price: Number(body?.wholesale_price ?? body?.regular_price ?? 0),
      bulk_price: Number(body?.bulk_price ?? body?.wholesale_price ?? 0),
      regular_min_qty: Number(body?.regular_min_qty ?? 10),
      wholesale_min_qty: Number(body?.wholesale_min_qty ?? 50),
      bulk_min_qty: Number(body?.bulk_min_qty ?? 100),
    };
    payload.price = payload.retail_price;

    const { data, error } = await auth.supabase
      .from("products")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error." },
      { status: 500 }
    );
  }
}
