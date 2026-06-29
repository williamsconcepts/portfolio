"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⬡" },
  { href: "/admin/posts", label: "Posts", icon: "✍️" },
  { href: "/admin/projects", label: "Projects", icon: "📂" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card min-h-screen flex flex-col py-6 px-3">
      <Link href="/admin" className="px-3 mb-8 block">
        <span className="font-mono font-bold text-ink text-sm">portfolio<span className="text-accent">/admin</span></span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-ink text-paper" : "text-muted hover:text-ink hover:bg-border"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 pt-4 border-t border-border mt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-ink hover:bg-border transition-colors"
        >
          <span>↗</span> View site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>→</span> Sign out
        </button>
      </div>
    </aside>
  );
}
