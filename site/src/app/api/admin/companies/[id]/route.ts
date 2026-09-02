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

type RouteContext = { params: Promise<{ id: string }> };

function revalidateCompanyPaths(slug: string) {
  revalidatePath("/admin/companies");
  revalidatePath(`/companies/${slug}`);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid company page", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.companyPage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = slugify(parsed.data.slug.trim());
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const talkingPoints = parsed.data.talkingPoints.map((point) => point.trim()).filter(Boolean);

  try {
    const company = await db.companyPage.update({
      where: { id },
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

    revalidateCompanyPaths(existing.slug);
    if (existing.slug !== company.slug) {
      revalidateCompanyPaths(company.slug);
    }

    return NextResponse.json({ company });
  } catch (err) {
    console.error("[admin/companies PUT]", err);
    const message = err instanceof Error ? err.message : "Could not save company page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const company = await db.companyPage.delete({ where: { id } });

  revalidateCompanyPaths(company.slug);
  return NextResponse.json({ ok: true });
}
