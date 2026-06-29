import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDir = path.join(process.cwd(), "data/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  contentHtml: string;
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const fullPath = path.join(postsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "",
      excerpt: data.excerpt || "",
      tags: data.tags || [],
      contentHtml: "",
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const processed = remark().use(html).processSync(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title || slug,
    date: data.date ? new Date(data.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "",
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    contentHtml,
  };
}
