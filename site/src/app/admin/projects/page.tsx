import { ProjectAdmin } from "@/components/project-admin";
import { db } from "@/lib/db";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { year: "desc" }] });

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-2">Projects</h1>
      <p className="text-muted mb-8">
        Add, edit, or delete projects. Pin slots 1–3 control which three appear on the home page and in what order.
      </p>
      <ProjectAdmin projects={projects} />
    </div>
  );
}
