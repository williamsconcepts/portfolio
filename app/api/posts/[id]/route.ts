// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/markdown";

// GET /api/posts/:id — public (by slug or id)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], published: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

// PATCH /api/posts/:id — update (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, content, excerpt, tags, published } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) {
      data.title = title;
      // regenerate slug only if title changed significantly
      data.slug = slugify(title);
    }
    if (content !== undefined) data.content = content;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (tags !== undefined) data.tags = tags;
    if (published !== undefined) data.published = published;

    const post = await prisma.post.update({ where: { id: params.id }, data });
    return NextResponse.json(post);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/posts/:id — delete (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
