import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/utils/auth";
import {
  getDbProjectBySlug,
  saveDbProject,
  deleteDbProject,
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
      const project = await getDbProjectBySlug(slug);
      if (project) {
        return NextResponse.json({ project });
      }
    }

    // Fallback to local
    const localProjects = getPosts(["src", "app", "work", "projects"]);
    const project = localProjects.find((p) => p.slug === slug);

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Error in GET /api/admin/projects/[slug]:", error);
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
    const { title, subtitle, publishedAt, summary, content, images, link, tag, status } =
      body;

    if (!title || !content || !summary) {
      return NextResponse.json(
        { message: "Missing required fields (title, summary, content)" },
        { status: 400 },
      );
    }

    const imageList = Array.isArray(images)
      ? images
      : typeof images === "string" && images.trim()
        ? [images.trim()]
        : [];

    if (isDbConfigured()) {
      const updated = await saveDbProject({
        slug,
        title,
        subtitle,
        publishedAt,
        summary,
        content,
        images: imageList,
        link,
        tag,
        status: status || "published",
      });

      return NextResponse.json({ success: true, project: updated });
    }

    // Fallback write to local file
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
    const filePath = path.join(projectsDir, `${slug}.mdx`);
    fs.writeFileSync(filePath, frontmatter, "utf-8");

    return NextResponse.json({ success: true, savedLocally: true });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/projects/[slug]:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update project" },
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
      await deleteDbProject(slug);
      return NextResponse.json({ success: true, message: "Project deleted from database" });
    }

    const projectsDir = path.join(process.cwd(), "src", "app", "work", "projects");
    const filePath = path.join(projectsDir, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, message: "Project deleted from local files" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/projects/[slug]:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to delete project" },
      { status: 500 },
    );
  }
}

