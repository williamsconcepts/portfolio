# Portfolio — Next.js

A clean, fast portfolio site with a projects section and blog. Built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Personalizing the Site

### Boobae & links

Edit these files to update Boobae, tagline, and social links:

| File | What to change |
|---|---|
| `app/layout.tsx` | Site title and meta description |
| `app/page.tsx` | Hero headline, tagline, CTA text |
| `components/Footer.tsx` | GitHub, Twitter, and email links |
| `components/Navbar.tsx` | Logo/domain text (e.g. `boobae.dev`) |

---

## Adding Projects

Create a `.json` file in `data/projects/` for each project:

```json
{
  "title": "My App",
  "description": "A short description of what it does and why you built it.",
  "emoji": "🚀",
  "url": "https://myapp.com",
  "repo": "https://github.com/yourusername/myapp",
  "tags": ["Next.js", "TypeScript", "Tailwind"],
  "featured": true
}
```

**Fields:**

| Field | Required | Description |
|---|---|---|
| `title` | ✅ | Project name |
| `description` | ✅ | One or two sentences |
| `emoji` | | Displayed as the project icon |
| `url` | | Link to the live site |
| `repo` | | Link to the source code |
| `tags` | | Array of tech stack tags |
| `featured` | | Set to `true` to sort it first |

---

## Writing Blog Posts

Create a `.md` file in `data/posts/`. The filename becomes the URL slug.

```markdown
---
title: "My First Post"
date: "2024-07-01"
excerpt: "A short summary shown in the listing."
tags: ["Next.js", "CSS"]
---

Your post content here, in **Markdown**.

## Headings, lists, code blocks — all supported.
```

**Frontmatter fields:**

| Field | Description |
|---|---|
| `title` | Post title (required) |
| `date` | Publication date in `YYYY-MM-DD` format |
| `excerpt` | Short summary shown on the blog listing |
| `tags` | Array of tag strings |

---

## Deployment

### Vercel (recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Click Deploy — it's automatic from there

### Other platforms

```bash
npm run build
npm start
```

---

## Project Structure

```
portfolio/
├── app/
│   ├── page.tsx          # Home page
│   ├── projects/
│   │   └── page.tsx      # Projects listing
│   └── blog/
│       ├── page.tsx      # Blog listing
│       └── [slug]/
│           └── page.tsx  # Individual post
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── lib/
│   ├── posts.ts          # Blog post helpers
│   └── projects.ts       # Project helpers
├── data/
│   ├── posts/            # ← Add .md files here
│   └── projects/         # ← Add .json files here
└── tailwind.config.js
```
