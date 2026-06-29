import fs from "fs";
import path from "path";

const projectsDir = path.join(process.cwd(), "data/projects");

export interface Project {
  slug: string;
  title: string;
  description: string;
  emoji?: string;
  url?: string;
  repo?: string;
  tags?: string[];
  featured?: boolean;
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json"));

  const projects = files.map((file) => {
    const slug = file.replace(/\.json$/, "");
    const fullPath = path.join(projectsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const data = JSON.parse(raw);
    return { slug, ...data } as Project;
  });

  // Featured first, then alphabetical
  return projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.title.localeCompare(b.title);
  });
}
