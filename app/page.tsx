import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const projects = getAllProjects().slice(0, 3);
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="mb-20">
        <p className="font-mono text-accent text-sm mb-4 tracking-wide">Hi, I&apos;m</p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-ink mb-6 leading-tight">
           Chidiebube
        </h1>
        <p className="text-xl text-muted max-w-xl leading-relaxed mb-8">
          Web developer focused on building fast, accessible, and beautiful digital experiences.
          I write about what I learn along the way.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="px-5 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/blog"
            className="px-5 py-2.5 border border-border text-ink rounded-lg text-sm font-medium hover:bg-card transition-colors"
          >
            Read Blog
          </Link>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-accent hover:underline font-medium">
            All projects →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="bg-card rounded-xl p-10 text-center">
            <p className="text-muted mb-2">No projects yet.</p>
            <p className="text-sm text-muted">Add a JSON file to <code className="font-mono text-xs bg-border px-1 py-0.5 rounded">data/projects/</code> to get started.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects#${p.slug}`} className="group block bg-card hover:bg-border/60 border border-border rounded-xl p-5 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{p.emoji || "🔧"}</span>
                  {p.url && (
                    <span className="text-xs text-muted group-hover:text-accent transition-colors">↗</span>
                  )}
                </div>
                <h3 className="font-semibold text-ink mb-1">{p.title}</h3>
                <p className="text-sm text-muted line-clamp-2">{p.description}</p>
                {p.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.tags.slice(0, 3).map((tag) => (
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
          <Link href="/blog" className="text-sm text-accent hover:underline font-medium">
            All posts →
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="bg-card rounded-xl p-10 text-center">
            <p className="text-muted mb-2">No posts yet.</p>
            <p className="text-sm text-muted">Add a Markdown file to <code className="font-mono text-xs bg-border px-1 py-0.5 rounded">data/posts/</code> to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-start justify-between gap-4 py-5 hover:bg-card -mx-4 px-4 rounded-lg transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-accent transition-colors mb-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted">{post.excerpt}</p>
                </div>
                <time className="text-xs text-muted whitespace-nowrap pt-1 font-mono">
                  {post.date}
                </time>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
