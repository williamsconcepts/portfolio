import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import { seedDbFromLocal, isDbConfigured } from "@/utils/db";

export async function POST(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        message:
          "DATABASE_URL or POSTGRES_URL environment variable is not configured. Please connect your Neon Postgres instance on Vercel.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await seedDbFromLocal();
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.count} posts into Neon database`,
      result,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/seed:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to seed posts" },
      { status: 500 },
    );
  }
}

