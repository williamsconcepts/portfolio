// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [postCount, publishedCount, projectCount] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.project.count(),
  ]);

  const recentPosts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, title: true, published: true, updatedAt: true },
  });

  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, title: true, emoji: true, updatedAt: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Posts", value: postCount },
          { label: "Published", value: publishedCount },
          { label: "Projects", value: projectCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-3xl font-bold text-ink mb-1">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent Posts</h2>
            <Link href="/admin/posts/new" className="text-xs text-accent hover:underline">+ New post</Link>
          </div>
          <div className="space-y-2">
            {recentPosts.length === 0 && <p className="text-sm text-muted">No posts yet.</p>}
            {recentPosts.map((p) => (
              <Link
                key={p.id}
                href={`/admin/posts/${p.id}`}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-border/60 transition-colors"
              >
                <span className="text-sm font-medium text-ink truncate">{p.title}</span>
                <span className={`text-xs font-mono ml-2 shrink-0 px-2 py-0.5 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.published ? "live" : "draft"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent Projects</h2>
            <Link href="/admin/projects/new" className="text-xs text-accent hover:underline">+ New project</Link>
          </div>
          <div className="space-y-2">
            {recentProjects.length === 0 && <p className="text-sm text-muted">No projects yet.</p>}
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-border/60 transition-colors"
              >
                <span>{p.emoji}</span>
                <span className="text-sm font-medium text-ink truncate">{p.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
