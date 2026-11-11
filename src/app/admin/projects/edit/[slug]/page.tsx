import { notFound } from "next/navigation";
import { getWorkProjectBySlug } from "@/utils/projects";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getWorkProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const initialData = {
    title: project.metadata.title,
    slug: project.slug,
    subtitle: project.metadata.subtitle,
    publishedAt: project.metadata.publishedAt,
    summary: project.metadata.summary,
    content: project.content,
    images: project.metadata.images || [],
    link: project.metadata.link,
    tag:
      typeof project.metadata.tag === "string"
        ? project.metadata.tag
        : Array.isArray(project.metadata.tag)
          ? (project.metadata.tag as any[]).filter(Boolean).join(", ")
          : undefined,
    status: project.metadata.status || "published",
  };

  return <ProjectEditor isEditing={true} initialData={initialData} />;
}

