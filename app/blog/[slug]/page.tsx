import { prisma } from "@/lib/prisma";
import { markdownToHtml } from "@/lib/markdown";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug, published: true } });
  if (!post) return {};
  return { title: `${post.title} — Your Name`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug, published: true } });
  if (!post) notFound();

  const contentHtml = await markdownToHtml(post.content);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-10 font-medium">
        ← Blog
      </Link>
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-ink mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted">
          <time className="font-mono">
            {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="font-mono bg-card border border-border px-2 py-0.5 rounded text-xs">{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      <div className="mt-16 pt-8 border-t border-border">
        <Link href="/blog" className="text-sm text-accent hover:underline font-medium">← Back to all posts</Link>
      </div>
    </div>
  );
}
