import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-2">Dashboard</h1>
      <p className="text-muted mb-8">Update your site content without opening Cursor.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/posts" className="admin-card hover:border-accent transition-colors duration-150">
          <h2 className="font-medium mb-2">Blog posts</h2>
          <p className="text-sm text-muted">Write, edit, publish, and delete essays.</p>
        </Link>
        <Link href="/admin/settings" className="admin-card hover:border-accent transition-colors duration-150">
          <h2 className="font-medium mb-2">Site settings</h2>
          <p className="text-sm text-muted">Update intro, bio, now list, and links.</p>
        </Link>
        <Link href="/admin/reading" className="admin-card hover:border-accent transition-colors duration-150">
          <h2 className="font-medium mb-2">Reading list</h2>
          <p className="text-sm text-muted">Add or remove books and articles.</p>
        </Link>
        <Link href="/admin/projects" className="admin-card hover:border-accent transition-colors duration-150">
          <h2 className="font-medium mb-2">Projects</h2>
          <p className="text-sm text-muted">View project entries seeded from the repo.</p>
        </Link>
      </div>
    </div>
  );
}
