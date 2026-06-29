// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/markdown";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.title !== undefined) { data.title = body.title; data.slug = slugify(body.title); }
    if (body.description !== undefined) data.description = body.description;
    if (body.emoji !== undefined) data.emoji = body.emoji;
    if (body.url !== undefined) data.url = body.url;
    if (body.repo !== undefined) data.repo = body.repo;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.order !== undefined) data.order = body.order;

    const project = await prisma.project.update({ where: { id: params.id }, data });
    return NextResponse.json(project);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
