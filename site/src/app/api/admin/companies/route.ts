import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-api";
import { slugify } from "@/lib/content";
import { serializeSections, serializeTalkingPoints } from "@/lib/company-page";
import { db } from "@/lib/db";

const sectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const companySchema = z.object({
  slug: z.string().min(1),
  orgName: z.string().min(1),
  roleTitle: z.string().min(1),
  heroHeadline: z.string().min(1),
  sections: z.array(sectionSchema),
  talkingPoints: z.array(z.string()),
  published: z.boolean().optional(),
});

function revalidateCompanyPaths(slug: string) {
  revalidatePath("/admin/companies");
  revalidatePath(`/companies/${slug}`);
}

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const companies = await db.companyPage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid company page" }, { status: 400 });
  }

  const slug = slugify(parsed.data.slug.trim());
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const talkingPoints = parsed.data.talkingPoints.map((point) => point.trim()).filter(Boolean);

  try {
    const company = await db.companyPage.create({
      data: {
        slug,
        orgName: parsed.data.orgName,
        roleTitle: parsed.data.roleTitle,
        heroHeadline: parsed.data.heroHeadline,
        sections: serializeSections(parsed.data.sections),
        talkingPoints: serializeTalkingPoints(talkingPoints),
        published: parsed.data.published ?? true,
      },
    });

    revalidateCompanyPaths(company.slug);
    return NextResponse.json({ company });
  } catch (err) {
    console.error("[admin/companies POST]", err);
    const message = err instanceof Error ? err.message : "Could not create company page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
