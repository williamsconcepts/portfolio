"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostEditorProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    published: boolean;
  };
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [published, setPublished] = useState(post?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState("");

  async function loadPreview() {
    if (tab === "write") {
      try {
        const { remark } = await import("remark");
        const html = await import("remark-html");
        const result = await remark().use(html.default).process(content);
        setPreviewHtml(result.toString());
      } catch {
        setPreviewHtml("<p>Preview unavailable</p>");
      }
      setTab("preview");
    } else {
      setTab("write");
    }
  }

  async function handleSave(asDraft = false) {
    setLoading(true);
    setError("");

    const body = {
      title,
      excerpt,
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      published: asDraft ? false : published,
    };

    const url = isEdit ? `/api/posts/${post.id}` : "/api/posts";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/posts");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm("Delete this post permanently?")) return;
    setLoading(true);
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Post" : "New Post"}</h1>
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
            onClick={() => handleSave(true)}
            disabled={loading}
            className="px-4 py-2 text-sm border border-border text-muted rounded-lg hover:bg-card transition-colors disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => { setPublished(true); handleSave(false); }}
            disabled={loading}
            className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Post Title"
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Excerpt <span className="text-muted font-normal">(shown in listing)</span></label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary of the post..."
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Tags <span className="text-muted font-normal">(comma-separated)</span></label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Next.js, React, TypeScript"
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-ink">Content <span className="text-muted font-normal">(Markdown)</span></label>
            <button
              onClick={loadPreview}
              className="text-xs text-accent hover:underline"
            >
              {tab === "write" ? "Preview →" : "← Edit"}
            </button>
          </div>

          {tab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"# My Post\n\nWrite your content in **Markdown**..."}
              rows={20}
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-paper text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
          ) : (
            <div
              className="prose min-h-[400px] border border-border rounded-lg p-5 bg-paper"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() => setPublished(!published)}
            className={`relative w-10 h-5 rounded-full transition-colors ${published ? "bg-accent" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${published ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm text-ink">
            {published ? "Published — visible on site" : "Draft — not visible on site"}
          </span>
        </div>
      </div>
    </div>
  );
}
