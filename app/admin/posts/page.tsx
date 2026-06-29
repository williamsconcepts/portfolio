// app/admin/posts/page.tsx
import type { Post } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPostsPage() {
  const posts: Post[] = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-accent transition-colors"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <p className="text-3xl mb-3">✍️</p>
          <p className="font-semibold mb-1">No posts yet</p>
          <p className="text-sm text-muted mb-4">Create your first blog post to get started.</p>
          <Link href="/admin/posts/new" className="text-sm text-accent hover:underline">Create a post →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/admin/posts/${p.id}`}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="text-xs text-muted mt-0.5 font-mono">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <time className="text-xs text-muted">
                  {new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.published ? "live" : "draft"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
