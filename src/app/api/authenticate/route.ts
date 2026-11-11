import { NextRequest, NextResponse } from "next/server";
import * as cookie from "cookie";
import { isDbConfigured } from "@/utils/db";
import { verifyAdminCredentials } from "@/utils/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, username = "admin" } = body;

  if (!password) {
    return NextResponse.json({ message: "Password is required" }, { status: 400 });
  }

  let isAuthenticated = false;

  // 1. Check Neon Database credentials first
  if (isDbConfigured()) {
    try {
      isAuthenticated = await verifyAdminCredentials(password, username);
    } catch (err) {
      console.error("Database authentication error:", err);
    }
  }

  // 2. Fallback to env variable if not authenticated via DB
  if (!isAuthenticated) {
    const envPassword = process.env.PAGE_ACCESS_PASSWORD;
    if (envPassword && password === envPassword) {
      isAuthenticated = true;
    }
  }

  if (isAuthenticated) {
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.headers.set(
      "Set-Cookie",
      cookie.serialize("authToken", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "strict",
        path: "/",
      }),
    );

    return response;
  }

  return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
}
