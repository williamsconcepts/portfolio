// app/admin/projects/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  return (
    <ProjectEditor
      project={{
        id: project.id,
        title: project.title,
        description: project.description,
        emoji: project.emoji || "🔧",
        url: project.url,
        repo: project.repo,
        tags: project.tags,
        featured: project.featured,
      }}
    />
  );
}
