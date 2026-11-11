import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import { saveMediaUpload, isDbConfigured } from "@/utils/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed" },
        { status: 400 },
      );
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "Image file exceeds 10MB size limit" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    const extension = path.extname(file.name) || ".jpg";
    const uniqueId = `img_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${extension}`;

    if (isDbConfigured()) {
      await saveMediaUpload({
        id: uniqueId,
        filename: file.name,
        mimeType: file.type || "image/jpeg",
        base64Data,
        sizeBytes: file.size,
      });

      return NextResponse.json({
        success: true,
        url: `/api/media/${uniqueId}`,
        filename: file.name,
        size: file.size,
      });
    }

    // Local fallback: save to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, uniqueId);
    fs.writeFileSync(localFilePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${uniqueId}`,
      filename: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/upload:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to upload image" },
      { status: 500 },
    );
  }
}

