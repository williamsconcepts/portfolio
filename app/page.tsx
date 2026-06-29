import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, posts] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, createdAt: true },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="mb-20">
        <p className="font-mono text-accent text-sm mb-4 tracking-wide">Hi, I&apos;m</p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-ink mb-6 leading-tight">
          Chidiebube
        </h1>
        <p className="text-xl text-muted max-w-xl leading-relaxed mb-8">
         A Web developer focused on building fast, accessible, and beautiful digital experiences.
          I write about what I learn along the way.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/projects" className="px-5 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-accent transition-colors">
            View Projects
          </Link>
          <Link href="/blog" className="px-5 py-2.5 border border-border text-ink rounded-lg text-sm font-medium hover:bg-card transition-colors">
            Read Blog
          </Link>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-accent hover:underline font-medium">All projects →</Link>
        </div>
        {projects.length === 0 ? (
          <div className="bg-card rounded-xl p-10 text-center border border-border">
            <p className="text-muted text-sm">No projects yet — add one from the <Link href="/admin" className="text-accent hover:underline">admin panel</Link>.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p: typeof projects[number]) => (
              <Link key={p.id} href={`/projects#${p.slug}`} className="group block bg-card hover:bg-border/60 border border-border rounded-xl p-5 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{p.emoji || "🔧"}</span>
                  {p.url && <span className="text-xs text-muted group-hover:text-accent transition-colors">↗</span>}
                </div>
                <h3 className="font-semibold text-ink mb-1">{p.title}</h3>
                <p className="text-sm text-muted line-clamp-2">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs font-mono bg-paper border border-border px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Blog Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link href="/blog" className="text-sm text-accent hover:underline font-medium">All posts →</Link>
        </div>
        {posts.length === 0 ? (
          <div className="bg-card rounded-xl p-10 text-center border border-border">
            <p className="text-muted text-sm">No posts yet — write one from the <Link href="/admin" className="text-accent hover:underline">admin panel</Link>.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post: typeof posts[number]) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex items-start justify-between gap-4 py-5 hover:bg-card -mx-4 px-4 rounded-lg transition-colors">
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-accent transition-colors mb-1">{post.title}</h3>
                  {post.excerpt && <p className="text-sm text-muted">{post.excerpt}</p>}
                </div>
                <time className="text-xs text-muted whitespace-nowrap pt-1 font-mono">
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
