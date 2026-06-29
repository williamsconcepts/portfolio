import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Boobae`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Back */}
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-10 font-medium">
        ← Blog
      </Link>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-ink mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted">
          <time className="font-mono">{post.date}</time>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="font-mono bg-card border border-border px-2 py-0.5 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Footer nav */}
      <div className="mt-16 pt-8 border-t border-border">
        <Link href="/blog" className="text-sm text-accent hover:underline font-medium">
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
