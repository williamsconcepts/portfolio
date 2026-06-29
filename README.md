# Portfolio — Next.js + PostgreSQL

A full-stack portfolio with a blog and projects section. Built with Next.js 14, Prisma, PostgreSQL, TypeScript, and Tailwind CSS.

---

## Stack

- **Next.js 14** (App Router)
- **PostgreSQL** via **Prisma ORM**
- **JWT auth** (via `jose`) with httpOnly cookies
- **Markdown** content rendered server-side
- **Tailwind CSS**

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio"
JWT_SECRET="run: openssl rand -base64 32"
```

### 3. Set up the database

```bash
# Push the schema to your database
npm run db:push

# (Optional) Seed with a sample admin user and data
npx ts-node prisma/seed.ts
```

Default seed credentials: `admin@example.com` / `changeme123`
**Change the password immediately after first login** (via Prisma Studio or `db:studio`).

### 4. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Database Options

Any PostgreSQL-compatible service works:

| Service | Free tier | Notes |
|---|---|---|
| **Supabase** | ✅ 500MB | Easiest setup, good dashboard |
| **Neon** | ✅ 3GB | Serverless, great for Vercel |
| **Railway** | ✅ $5 credit | Simple UI |
| **Local** | ✅ | `brew install postgresql` |

---

## Admin Panel

Go to `/admin/login` to sign in.

| Page | URL |
|---|---|
| Dashboard | `/admin` |
| Posts list | `/admin/posts` |
| New post | `/admin/posts/new` |
| Edit post | `/admin/posts/[id]` |
| Projects list | `/admin/projects` |
| New project | `/admin/projects/new` |
| Edit project | `/admin/projects/[id]` |

---

## Writing Posts

Posts are written in the admin UI using **Markdown**. Supported syntax:

- `# H1`, `## H2`, `### H3` headings
- `**bold**`, `*italic*`
- `` `inline code` `` and fenced code blocks
- `- unordered` and `1. ordered` lists
- `> blockquotes`
- `[links](url)` and `![images](url)`

Posts can be saved as **drafts** (not visible on site) or **published** (live immediately).

---

## API Reference

All write endpoints require a valid session cookie (set on login).

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Sign in `{ email, password }` |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | All published posts |
| GET | `/api/posts?all=true` | All posts incl. drafts (auth) |
| POST | `/api/posts` | Create post (auth) |
| GET | `/api/posts/[id]` | Get post by id or slug |
| PATCH | `/api/posts/[id]` | Update post (auth) |
| DELETE | `/api/posts/[id]` | Delete post (auth) |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | All projects |
| POST | `/api/projects` | Create project (auth) |
| GET | `/api/projects/[id]` | Get project by id or slug |
| PATCH | `/api/projects/[id]` | Update project (auth) |
| DELETE | `/api/projects/[id]` | Delete project (auth) |

---

## Deployment (Vercel + Neon)

1. Create a Postgres database on [Neon](https://neon.tech) (free)
2. Copy the connection string
3. Push to GitHub
4. Import the repo to [Vercel](https://vercel.com)
5. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` — from Neon
   - `JWT_SECRET` — `openssl rand -base64 32`
6. Add to Vercel build command: `prisma generate && next build`
7. After first deploy, run migrations: `npx prisma db push` locally against the Neon URL

---

## Personalizing

Search and replace `Your Name` and `yourname.dev` across:
- `app/layout.tsx` — site title
- `app/page.tsx` — hero text
- `components/Navbar.tsx` — logo
- `components/Footer.tsx` — social links

---

## Database Scripts

```bash
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:push       # Push schema to database (no migration files)
npm run db:migrate    # Create and apply a named migration
npm run db:studio     # Open Prisma Studio (visual DB editor)
```
