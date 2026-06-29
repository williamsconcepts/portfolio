import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects — Your Name",
  description: "Web development projects I've built.",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Projects</h1>
        <p className="text-muted text-lg">Things I&apos;ve built — from side projects to full products.</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card rounded-2xl p-16 text-center border border-border">
          <p className="text-3xl mb-4">📂</p>
          <p className="font-semibold text-ink mb-2">No projects yet</p>
          <p className="text-sm text-muted">Add projects from the admin panel.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((p) => (
            <article key={p.id} id={p.slug} className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{p.emoji || "🔧"}</span>
                <div className="flex gap-2">
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-muted hover:text-ink border border-border px-3 py-1 rounded-lg transition-colors">Code</a>
                  )}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono bg-ink text-paper px-3 py-1 rounded-lg hover:bg-accent transition-colors">Live ↗</a>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-bold text-ink mb-2">{p.title}</h2>
              <p className="text-sm text-muted leading-relaxed flex-1 mb-4">{p.description}</p>
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-xs font-mono bg-paper border border-border px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
