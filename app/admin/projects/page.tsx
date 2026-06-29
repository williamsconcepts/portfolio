// app/admin/projects/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  emoji: string;
  featured: boolean;
  tags: string[];
}

export default async function AdminProjectsPage(): Promise<JSX.Element> {
  const projects: Project[] = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-accent transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <p className="text-3xl mb-3">📂</p>
          <p className="font-semibold mb-1">No projects yet</p>
          <p className="text-sm text-muted mb-4">Add your first project to show off your work.</p>
          <Link href="/admin/projects/new" className="text-sm text-accent hover:underline">Create a project →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p: Project) => (
            <Link
              key={p.id}
              href={`/admin/projects/${p.id}`}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
            >
              <span className="text-xl">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{p.title}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{p.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.featured && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700">featured</span>
                )}
                <div className="flex gap-1.5">
                  {p.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-xs font-mono bg-paper border border-border px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
