import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="admin-shell">
      <main className="site-container py-16 max-w-xl">
        <h1 className="font-display text-4xl font-semibold mb-2">Admin sign in</h1>
        <p className="text-muted mb-8">Manage blog posts, reading list, and site content.</p>
        <AdminLoginForm />
      </main>
    </div>
  );
}
