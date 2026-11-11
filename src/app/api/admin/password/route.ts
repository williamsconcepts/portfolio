import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated, verifyAdminCredentials, updateAdminPassword } from "@/utils/auth";
import { isDbConfigured } from "@/utils/db";

export async function PUT(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        message:
          "Neon Database is not configured. Password changes require an active database connection.",
      },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Verify current password first
    const isCurrentValid =
      (await verifyAdminCredentials(currentPassword)) ||
      currentPassword === process.env.PAGE_ACCESS_PASSWORD;

    if (!isCurrentValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Update in database
    await updateAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully in database!",
    });
  } catch (error: any) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update password" },
      { status: 500 },
    );
  }
}

