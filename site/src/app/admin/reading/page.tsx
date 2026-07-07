import { ReadingAdmin } from "@/components/reading-admin";
import { db } from "@/lib/db";

export default async function AdminReadingPage() {
  const items = await db.readingItem.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-8">Reading list</h1>
      <ReadingAdmin items={items} />
    </div>
  );
}
