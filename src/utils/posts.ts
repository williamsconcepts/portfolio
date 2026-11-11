import { getAllDbPosts, getDbPostBySlug, isDbConfigured } from "./db";
import { getPosts } from "./utils";

export interface BlogPost {
  slug: string;
  metadata: {
    title: string;
    subtitle?: string;
    publishedAt: string;
    summary: string;
    image?: string;
    images?: string[];
    tag?: string;
    team?: Array<{
      name: string;
      role: string;
      avatar: string;
      linkedIn: string;
    }>;
    link?: string;
    status?: "published" | "draft";
  };
  content: string;
}

/**
 * Retrieves all published blog posts.
 * If Neon database is configured, fetches from Neon.
 * Falls back to local MDX files if Neon is not configured or in case of error.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (isDbConfigured()) {
    try {
      const dbPosts = await getAllDbPosts(false);
      if (dbPosts && dbPosts.length > 0) {
        return dbPosts as BlogPost[];
      }
    } catch (error) {
      console.error("Error fetching posts from Neon database, falling back to local files:", error);
    }
  }

  // Fallback to local files
  return getPosts(["src", "app", "blog", "posts"]) as BlogPost[];
}

/**
 * Retrieves a single blog post by its slug.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isDbConfigured()) {
    try {
      const post = await getDbPostBySlug(slug);
      if (post) return post as BlogPost;
    } catch (error) {
      console.error("Error fetching post from Neon database, falling back to local files:", error);
    }
  }

  const localPosts = getPosts(["src", "app", "blog", "posts"]);
  const found = localPosts.find((p) => p.slug === slug);
  return (found as BlogPost) || null;
}

