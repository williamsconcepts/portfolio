import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog — Boobae",
  description: "Thoughts on web development, tooling, and the craft of building things.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Blog</h1>
        <p className="text-muted text-lg">Thoughts on web dev, tooling, and building things.</p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-card rounded-2xl p-16 text-center border border-border">
          <p className="text-3xl mb-4">✍️</p>
          <p className="font-semibold text-ink mb-2">No posts yet</p>
          <p className="text-sm text-muted">
            Add a <code className="font-mono text-xs bg-border px-1 py-0.5 rounded">.md</code> file to{" "}
            <code className="font-mono text-xs bg-border px-1 py-0.5 rounded">data/posts/</code> to publish your first post.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block py-7 -mx-4 px-4 hover:bg-card rounded-xl transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-ink group-hover:text-accent transition-colors mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-muted text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs font-mono bg-paper border border-border px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <time className="text-xs text-muted font-mono pt-1 whitespace-nowrap">{post.date}</time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
