import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getPosts } from "./utils";
import { hashPassword } from "./crypto";

export interface DbPostRecord {
  id?: number;
  slug: string;
  title: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  content: string;
  tag?: string;
  image?: string;
  images?: string[];
  link?: string;
  status?: "published" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export interface DbProjectRecord {
  id?: number;
  slug: string;
  title: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  content: string;
  images?: string[];
  link?: string;
  tag?: string;
  status?: "published" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export function getConnectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

export function isDbConfigured(): boolean {
  return Boolean(getConnectionString());
}

export function getSql(): NeonQueryFunction<false, false> {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL or POSTGRES_URL is not configured. Please add your Neon connection string in your .env or Vercel environment variables.",
    );
  }
  return neon(connectionString);
}

/**
 * Initializes database tables in Neon if they don't already exist.
 */
export async function initDb(): Promise<void> {
  if (!isDbConfigured()) return;
  const sql = getSql();

  // Posts table
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      published_at DATE NOT NULL DEFAULT CURRENT_DATE,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      tag VARCHAR(100),
      image TEXT,
      images TEXT[] DEFAULT ARRAY[]::TEXT[],
      link TEXT,
      status VARCHAR(20) DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Work Projects table
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      published_at DATE NOT NULL DEFAULT CURRENT_DATE,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT[] DEFAULT ARRAY[]::TEXT[],
      link TEXT,
      tag VARCHAR(100),
      status VARCHAR(20) DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Site Settings table (for profile, about us, etc.)
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Admin Users table (for storing login credentials in Neon DB)
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL DEFAULT 'admin',
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Media Uploads table (for storing uploaded images directly in Neon Postgres)
  await sql`
    CREATE TABLE IF NOT EXISTS media_uploads (
      id VARCHAR(64) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      base64_data TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Auto-seed default admin credentials if table is currently empty
  const users = await sql`SELECT id FROM admin_users LIMIT 1;`;
  if (!users || users.length === 0) {
    const initialPass = process.env.PAGE_ACCESS_PASSWORD || "admin1234";
    const hashed = hashPassword(initialPass);
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', ${hashed})
      ON CONFLICT (username) DO NOTHING;
    `;
  }
}

/* =========================================================
   POSTS CRUD
   ========================================================= */

export async function getAllDbPosts(includeDrafts = false) {
  if (!isDbConfigured()) return [];
  const sql = getSql();
  await initDb();

  const rows = includeDrafts
    ? await sql`SELECT * FROM posts ORDER BY published_at DESC, created_at DESC;`
    : await sql`SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC, created_at DESC;`;

  return rows.map(formatPostRow);
}

export async function getDbPostBySlug(slug: string) {
  if (!isDbConfigured()) return null;
  const sql = getSql();
  await initDb();

  const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1;`;
  if (!rows || rows.length === 0) return null;

  return formatPostRow(rows[0]);
}

export async function saveDbPost(data: DbPostRecord) {
  const sql = getSql();
  await initDb();

  const slug = data.slug.trim().toLowerCase();
  const publishedAt = data.publishedAt || new Date().toISOString().split("T")[0];
  const images = data.images || [];
  const status = data.status || "published";

  const rows = await sql`
    INSERT INTO posts (
      slug,
      title,
      subtitle,
      published_at,
      summary,
      content,
      tag,
      image,
      images,
      link,
      status,
      updated_at
    )
    VALUES (
      ${slug},
      ${data.title},
      ${data.subtitle || null},
      ${publishedAt},
      ${data.summary},
      ${data.content},
      ${data.tag || null},
      ${data.image || null},
      ${images},
      ${data.link || null},
      ${status},
      NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      published_at = EXCLUDED.published_at,
      summary = EXCLUDED.summary,
      content = EXCLUDED.content,
      tag = EXCLUDED.tag,
      image = EXCLUDED.image,
      images = EXCLUDED.images,
      link = EXCLUDED.link,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING *;
  `;

  return formatPostRow(rows[0]);
}

export async function deleteDbPost(slug: string): Promise<boolean> {
  const sql = getSql();
  await initDb();

  const result = await sql`DELETE FROM posts WHERE slug = ${slug} RETURNING id;`;
  return result.length > 0;
}

export async function seedDbFromLocal(): Promise<{ count: number; imported: string[] }> {
  const localPosts = getPosts(["src", "app", "blog", "posts"]);
  const imported: string[] = [];

  for (const post of localPosts) {
    await saveDbPost({
      slug: post.slug,
      title: post.metadata.title,
      subtitle: post.metadata.subtitle,
      publishedAt: post.metadata.publishedAt,
      summary: post.metadata.summary,
      content: post.content,
      tag: typeof post.metadata.tag === "string" ? post.metadata.tag : undefined,
      image: post.metadata.image,
      images: post.metadata.images,
      link: post.metadata.link,
      status: "published",
    });
    imported.push(post.slug);
  }

  return { count: imported.length, imported };
}

/* =========================================================
   WORK PROJECTS CRUD
   ========================================================= */

export async function getAllDbProjects(includeDrafts = false) {
  if (!isDbConfigured()) return [];
  const sql = getSql();
  await initDb();

  const rows = includeDrafts
    ? await sql`SELECT * FROM projects ORDER BY published_at DESC, created_at DESC;`
    : await sql`SELECT * FROM projects WHERE status = 'published' ORDER BY published_at DESC, created_at DESC;`;

  return rows.map(formatProjectRow);
}

export async function getDbProjectBySlug(slug: string) {
  if (!isDbConfigured()) return null;
  const sql = getSql();
  await initDb();

  const rows = await sql`SELECT * FROM projects WHERE slug = ${slug} LIMIT 1;`;
  if (!rows || rows.length === 0) return null;

  return formatProjectRow(rows[0]);
}

export async function saveDbProject(data: DbProjectRecord) {
  const sql = getSql();
  await initDb();

  const slug = data.slug.trim().toLowerCase();
  const publishedAt = data.publishedAt || new Date().toISOString().split("T")[0];
  const images = data.images || [];
  const status = data.status || "published";

  const rows = await sql`
    INSERT INTO projects (
      slug,
      title,
      subtitle,
      published_at,
      summary,
      content,
      images,
      link,
      tag,
      status,
      updated_at
    )
    VALUES (
      ${slug},
      ${data.title},
      ${data.subtitle || null},
      ${publishedAt},
      ${data.summary},
      ${data.content},
      ${images},
      ${data.link || null},
      ${data.tag || null},
      ${status},
      NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      published_at = EXCLUDED.published_at,
      summary = EXCLUDED.summary,
      content = EXCLUDED.content,
      images = EXCLUDED.images,
      link = EXCLUDED.link,
      tag = EXCLUDED.tag,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING *;
  `;

  return formatProjectRow(rows[0]);
}

export async function deleteDbProject(slug: string): Promise<boolean> {
  const sql = getSql();
  await initDb();

  const result = await sql`DELETE FROM projects WHERE slug = ${slug} RETURNING id;`;
  return result.length > 0;
}

export async function seedDbProjectsFromLocal(): Promise<{ count: number; imported: string[] }> {
  const localProjects = getPosts(["src", "app", "work", "projects"]);
  const imported: string[] = [];

  for (const proj of localProjects) {
    await saveDbProject({
      slug: proj.slug,
      title: proj.metadata.title,
      subtitle: proj.metadata.subtitle,
      publishedAt: proj.metadata.publishedAt,
      summary: proj.metadata.summary,
      content: proj.content,
      images: proj.metadata.images || (proj.metadata.image ? [proj.metadata.image] : []),
      link: proj.metadata.link,
      tag: typeof proj.metadata.tag === "string" ? proj.metadata.tag : undefined,
      status: "published",
    });
    imported.push(proj.slug);
  }

  return { count: imported.length, imported };
}

/* =========================================================
   SITE SETTINGS (Profile, About, Social, etc.)
   ========================================================= */

export async function getSetting<T = any>(key: string): Promise<T | null> {
  if (!isDbConfigured()) return null;
  const sql = getSql();
  await initDb();

  const rows = await sql`SELECT data FROM site_settings WHERE key = ${key} LIMIT 1;`;
  if (!rows || rows.length === 0) return null;

  return rows[0].data as T;
}

export async function saveSetting<T = any>(key: string, data: T): Promise<T> {
  const sql = getSql();
  await initDb();

  await sql`
    INSERT INTO site_settings (key, data, updated_at)
    VALUES (${key}, ${JSON.stringify(data)}, NOW())
    ON CONFLICT (key) DO UPDATE SET
      data = EXCLUDED.data,
      updated_at = NOW();
  `;

  return data;
}

/* =========================================================
   MEDIA UPLOADS (Images stored in Neon)
   ========================================================= */

export async function saveMediaUpload(item: {
  id: string;
  filename: string;
  mimeType: string;
  base64Data: string;
  sizeBytes: number;
}) {
  const sql = getSql();
  await initDb();

  await sql`
    INSERT INTO media_uploads (id, filename, mime_type, base64_data, size_bytes, created_at)
    VALUES (${item.id}, ${item.filename}, ${item.mimeType}, ${item.base64Data}, ${item.sizeBytes}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      filename = EXCLUDED.filename,
      mime_type = EXCLUDED.mime_type,
      base64_data = EXCLUDED.base64_data,
      size_bytes = EXCLUDED.size_bytes;
  `;

  return item;
}

export async function getMediaUpload(id: string) {
  if (!isDbConfigured()) return null;
  const sql = getSql();
  await initDb();

  const rows = await sql`
    SELECT id, filename, mime_type, base64_data, size_bytes
    FROM media_uploads
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!rows || rows.length === 0) return null;
  return rows[0] as {
    id: string;
    filename: string;
    mime_type: string;
    base64_data: string;
    size_bytes: number;
  };
}

/* =========================================================
   HELPERS / ROW FORMATTERS
   ========================================================= */

function formatPostRow(row: any) {
  const publishedDate = row.published_at
    ? new Date(row.published_at).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    slug: row.slug as string,
    metadata: {
      title: (row.title as string) || "",
      subtitle: (row.subtitle as string) || "",
      publishedAt: publishedDate,
      summary: (row.summary as string) || "",
      image: (row.image as string) || "",
      images: (row.images as string[]) || [],
      tag: (row.tag as string) || "",
      team: [],
      link: (row.link as string) || "",
      status: (row.status as "published" | "draft") || "published",
    },
    content: (row.content as string) || "",
  };
}

function formatProjectRow(row: any) {
  const publishedDate = row.published_at
    ? new Date(row.published_at).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    slug: row.slug as string,
    metadata: {
      title: (row.title as string) || "",
      subtitle: (row.subtitle as string) || "",
      publishedAt: publishedDate,
      summary: (row.summary as string) || "",
      image: (row.images && row.images[0]) || "",
      images: (row.images as string[]) || [],
      tag: (row.tag as string) || "",
      team: [],
      link: (row.link as string) || "",
      status: (row.status as "published" | "draft") || "published",
    },
    content: (row.content as string) || "",
  };
}
