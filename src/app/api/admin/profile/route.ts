import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import { getProfileData, updateProfileData } from "@/utils/profile";

export async function GET(request: NextRequest) {
  try {
    const profile = await getProfileData();
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Error in GET /api/admin/profile:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch profile data" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateProfileData(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/profile:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update profile data" },
      { status: 500 },
    );
  }
}

