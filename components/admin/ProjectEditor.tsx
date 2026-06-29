"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectEditorProps {
  project?: {
    id: string;
    title: string;
    description: string;
    emoji: string;
    url: string | null;
    repo: string | null;
    tags: string[];
    featured: boolean;
  };
}

const EMOJI_OPTIONS = ["🔧", "🚀", "⚡", "🎨", "📱", "🔖", "⛅", "✅", "🌐", "🤖", "📊", "🎮", "🔐", "📝", "🛠️"];

export default function ProjectEditor({ project }: ProjectEditorProps) {
  const router = useRouter();
  const isEdit = !!project;

  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [emoji, setEmoji] = useState(project?.emoji || "🔧");
  const [url, setUrl] = useState(project?.url || "");
  const [repo, setRepo] = useState(project?.repo || "");
  const [tags, setTags] = useState(project?.tags?.join(", ") || "");
  const [featured, setFeatured] = useState(project?.featured || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setError("");

    const body = {
      title,
      description,
      emoji,
      url: url || null,
      repo: repo || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured,
    };

    const apiUrl = isEdit ? `/api/projects/${project.id}` : "/api/projects";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(apiUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/projects");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm("Delete this project permanently?")) return;
    setLoading(true);
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Project" : "New Project"}</h1>
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create project"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="space-y-5">
        {/* Emoji picker */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-xl w-10 h-10 rounded-lg border-2 transition-colors ${
                  emoji === e ? "border-accent bg-blue-50" : "border-border hover:border-ink"
                }`}
              >
                {e}
              </button>
            ))}
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={2}
              className="w-10 h-10 text-xl text-center border-2 border-border rounded-lg bg-paper focus:outline-none focus:border-accent"
              placeholder="?"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Project"
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this project do and why did you build it?"
            rows={3}
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink resize-none focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Tech stack <span className="text-muted font-normal">(comma-separated)</span></label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Next.js, TypeScript, Tailwind"
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* URLs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Live URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myproject.com"
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Repo URL</label>
            <input
              type="url"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="https://github.com/you/project"
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            role="switch"
            aria-checked={featured}
            onClick={() => setFeatured(!featured)}
            className={`relative w-10 h-5 rounded-full transition-colors ${featured ? "bg-accent" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${featured ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm text-ink">
            {featured ? "Featured — shown first on homepage" : "Not featured"}
          </span>
        </div>
      </div>
    </div>
  );
}
