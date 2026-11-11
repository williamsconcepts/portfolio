import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/utils/posts";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const initialData = {
    title: post.metadata.title,
    slug: post.slug,
    subtitle: post.metadata.subtitle,
    publishedAt: post.metadata.publishedAt,
    summary: post.metadata.summary,
    content: post.content,
    tag:
      typeof post.metadata.tag === "string"
        ? post.metadata.tag
        : Array.isArray(post.metadata.tag)
          ? (post.metadata.tag as any[]).filter(Boolean).join(", ")
          : undefined,
    image: post.metadata.image,
    status: post.metadata.status || "published",
  };

  return <PostEditor isEditing={true} initialData={initialData} />;
}

