import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import {
  getAllDbProjects,
  saveDbProject,
  isDbConfigured,
  seedDbProjectsFromLocal,
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
    let projects = [];

    if (dbAvailable) {
      projects = await getAllDbProjects(true);
      // Auto-seed if empty
      if (projects.length === 0) {
        try {
          await seedDbProjectsFromLocal();
          projects = await getAllDbProjects(true);
        } catch (seedErr) {
          console.error("Auto-seed error for projects:", seedErr);
        }
      }
    } else {
      projects = getPosts(["src", "app", "work", "projects"]);
    }

    return NextResponse.json({
      projects,
      isDbConfigured: dbAvailable,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/projects:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch projects" },
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
    const { title, slug, subtitle, publishedAt, summary, content, images, link, tag, status } =
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

    const imageList = Array.isArray(images)
      ? images
      : typeof images === "string" && images.trim()
        ? [images.trim()]
        : [];

    if (isDbConfigured()) {
      const saved = await saveDbProject({
        slug: cleanSlug,
        title,
        subtitle,
        publishedAt: publishedAt || new Date().toISOString().split("T")[0],
        summary,
        content,
        images: imageList,
        link,
        tag,
        status: status || "published",
      });

      return NextResponse.json({ success: true, project: saved }, { status: 201 });
    }

    // Local file fallback
    const frontmatterImages = imageList.length
      ? `images:\n${imageList.map((img: string) => `  - "${img}"`).join("\n")}`
      : "";

    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      subtitle ? `subtitle: "${subtitle.replace(/"/g, '\\"')}"` : null,
      `publishedAt: "${publishedAt || new Date().toISOString().split("T")[0]}"`,
      `summary: "${summary.replace(/"/g, '\\"')}"`,
      frontmatterImages || null,
      link ? `link: "${link}"` : null,
      tag ? `tag: "${tag}"` : null,
      "---",
      "",
      content,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const projectsDir = path.join(process.cwd(), "src", "app", "work", "projects");
    fs.writeFileSync(path.join(projectsDir, `${cleanSlug}.mdx`), frontmatter, "utf-8");

    return NextResponse.json(
      {
        success: true,
        project: { slug: cleanSlug, metadata: { title, summary, images: imageList }, content },
        savedLocally: true,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/admin/projects:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to save project" },
      { status: 500 },
    );
  }
}

