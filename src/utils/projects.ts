import { getAllDbProjects, getDbProjectBySlug, isDbConfigured } from "./db";
import { getPosts } from "./utils";

export interface WorkProject {
  slug: string;
  metadata: {
    title: string;
    subtitle?: string;
    publishedAt: string;
    summary: string;
    image?: string;
    images: string[];
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
 * Retrieves all published work projects.
 * If Neon database is configured, fetches from Neon.
 * Falls back to local MDX files if Neon is not configured or in case of error.
 */
export async function getWorkProjects(): Promise<WorkProject[]> {
  if (isDbConfigured()) {
    try {
      const dbProjects = await getAllDbProjects(false);
      if (dbProjects && dbProjects.length > 0) {
        return dbProjects as WorkProject[];
      }
    } catch (error) {
      console.error("Error fetching projects from Neon database, falling back to local files:", error);
    }
  }

  // Fallback to local files
  return getPosts(["src", "app", "work", "projects"]) as WorkProject[];
}

/**
 * Retrieves a single work project by its slug.
 */
export async function getWorkProjectBySlug(slug: string): Promise<WorkProject | null> {
  if (isDbConfigured()) {
    try {
      const project = await getDbProjectBySlug(slug);
      if (project) return project as WorkProject;
    } catch (error) {
      console.error("Error fetching project from Neon database, falling back to local files:", error);
    }
  }

  const localProjects = getPosts(["src", "app", "work", "projects"]);
  const found = localProjects.find((p) => p.slug === slug);
  return (found as WorkProject) || null;
}

