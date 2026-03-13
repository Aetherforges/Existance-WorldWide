import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

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

function requireAdmin() {
  const adminSession = cookies().get("admin_session");
  if (!adminSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, ...payload } = body;
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("products").delete().eq("id", body.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
