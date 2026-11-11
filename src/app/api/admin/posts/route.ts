import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import {
  getAllDbPosts,
  saveDbPost,
  isDbConfigured,
  seedDbFromLocal,
} from "@/utils/db";
import { getPosts } from "@/utils/utils";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbAvailable = isDbConfigured();
    let posts = [];

    if (dbAvailable) {
      posts = await getAllDbPosts(true);
      // If DB is empty, auto-seed with existing local posts so user sees their content right away!
      if (posts.length === 0) {
        try {
          await seedDbFromLocal();
          posts = await getAllDbPosts(true);
        } catch (seedErr) {
          console.error("Auto-seed error:", seedErr);
        }
      }
    } else {
      // Local fallback
      posts = getPosts(["src", "app", "blog", "posts"]);
    }

    return NextResponse.json({
      posts,
      isDbConfigured: dbAvailable,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/posts:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, subtitle, publishedAt, summary, content, tag, image, status } =
      body;

    if (!title || !slug || !content || !summary) {
      return NextResponse.json(
        { message: "Missing required fields (title, slug, summary, content)" },
        { status: 400 },
      );
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    if (isDbConfigured()) {
      const saved = await saveDbPost({
        slug: cleanSlug,
        title,
        subtitle,
        publishedAt: publishedAt || new Date().toISOString().split("T")[0],
        summary,
        content,
        tag,
        image,
        status: status || "published",
      });

      return NextResponse.json({ success: true, post: saved }, { status: 201 });
    }

    // In local dev without DB configured, save to local MDX file
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
    fs.writeFileSync(path.join(postsDir, `${cleanSlug}.mdx`), frontmatter, "utf-8");

    return NextResponse.json(
      {
        success: true,
        post: { slug: cleanSlug, metadata: { title, summary }, content },
        savedLocally: true,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/admin/posts:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to save post" },
      { status: 500 },
    );
  }
}

