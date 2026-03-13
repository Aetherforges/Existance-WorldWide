import { NextResponse } from "next/server";

export async function POST(request) {
  const { username, password } = await request.json();
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    return NextResponse.json(
      { message: "Admin credentials not configured." },
      { status: 500 }
    );
  }

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Authenticated" });
  response.cookies.set("admin_session", "true", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
