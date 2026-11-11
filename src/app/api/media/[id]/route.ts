import { NextRequest, NextResponse } from "next/server";
import { getMediaUpload, isDbConfigured } from "@/utils/db";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. Try Neon Postgres
  if (isDbConfigured()) {
    try {
      const media = await getMediaUpload(id);
      if (media && media.base64_data) {
        const buffer = Buffer.from(media.base64_data, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": media.mime_type || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (err) {
      console.error("Error retrieving media from Neon:", err);
    }
  }

  // 2. Try Local Fallback in public/uploads/
  const localDir = path.join(process.cwd(), "public", "uploads");
  const localFile = path.join(localDir, id);

  if (fs.existsSync(localFile)) {
    const fileBuffer = fs.readFileSync(localFile);
    const ext = path.extname(id).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new NextResponse("Image not found", { status: 404 });
}

