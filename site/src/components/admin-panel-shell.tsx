import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin-logout-button";

export function AdminPanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="border-b border-rule bg-surface/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="site-container h-14 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="font-medium">
              Admin
            </Link>
            <Link href="/admin/posts" className="text-muted hover:text-ink">
              Posts
            </Link>
            <Link href="/admin/settings" className="text-muted hover:text-ink">
              Settings
            </Link>
            <Link href="/admin/reading" className="text-muted hover:text-ink">
              Reading
            </Link>
            <Link href="/admin/projects" className="text-muted hover:text-ink">
              Projects
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted hover:text-ink">
              View site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="site-container py-8">{children}</main>
    </div>
  );
}
