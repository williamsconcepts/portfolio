import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import {
  getDbPostBySlug,
  saveDbPost,
  deleteDbPost,
  isDbConfigured,
} from "@/utils/db";
import { getPosts } from "@/utils/utils";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    if (isDbConfigured()) {
      const post = await getDbPostBySlug(slug);
      if (post) {
        return NextResponse.json({ post });
      }
    }

    // Fallback to local
    const localPosts = getPosts(["src", "app", "blog", "posts"]);
    const post = localPosts.find((p) => p.slug === slug);

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("Error in GET /api/admin/posts/[slug]:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const body = await request.json();
    const { title, subtitle, publishedAt, summary, content, tag, image, status } =
      body;

    if (!title || !content || !summary) {
      return NextResponse.json(
        { message: "Missing required fields (title, summary, content)" },
        { status: 400 },
      );
    }

    if (isDbConfigured()) {
      const updated = await saveDbPost({
        slug,
        title,
        subtitle,
        publishedAt,
        summary,
        content,
        tag,
        image,
        status: status || "published",
      });

      return NextResponse.json({ success: true, post: updated });
    }

    // Fallback write to local file
    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      subtitle ? `subtitle: "${subtitle.replace(/"/g, '\\"')}"` : null,
      `publishedAt: "${publishedAt || new Date().toISOString().split("T")[0]}"`,
      `summary: "${summary.replace(/"/g, '\\"')}"`,
      tag ? `tag: "${tag}"` : null,
      image ? `image: "${image}"` : null,
      "---",
      "",
      content,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const postsDir = path.join(process.cwd(), "src", "app", "blog", "posts");
    const filePath = path.join(postsDir, `${slug}.mdx`);
    fs.writeFileSync(filePath, frontmatter, "utf-8");

    return NextResponse.json({ success: true, savedLocally: true });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/posts/[slug]:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    if (isDbConfigured()) {
      await deleteDbPost(slug);
      return NextResponse.json({ success: true, message: "Post deleted from database" });
    }

    // Fallback local file deletion
    const postsDir = path.join(process.cwd(), "src", "app", "blog", "posts");
    const filePath = path.join(postsDir, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, message: "Post deleted from local files" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/posts/[slug]:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to delete post" },
      { status: 500 },
    );
  }
}

