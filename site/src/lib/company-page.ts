export type CompanySection = {
  title: string;
  content: string;
};

export function parseTalkingPoints(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((point): point is string => typeof point === "string" && point.trim().length > 0);
  } catch {
    return [];
  }
}

export function serializeTalkingPoints(points: string[]): string {
  return JSON.stringify(points);
}

export function parseSections(value: string): CompanySection[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const title = typeof record.title === "string" ? record.title.trim() : "";
        const content = typeof record.content === "string" ? record.content.trim() : "";
        if (!title || !content) return null;
        return { title, content };
      })
      .filter((section): section is CompanySection => section !== null);
  } catch {
    return [];
  }
}

export function serializeSections(sections: CompanySection[]): string {
  return JSON.stringify(sections);
}

type LegacyCompanyPage = {
  sections: string;
  whyThisOrg?: string | null;
  relevantExperience?: string | null;
};

export function resolveCompanySections(company: LegacyCompanyPage): CompanySection[] {
  const sections = parseSections(company.sections);
  if (sections.length > 0) return sections;

  const legacy: CompanySection[] = [];
  if (company.whyThisOrg?.trim()) {
    legacy.push({ title: "Why this organization", content: company.whyThisOrg.trim() });
  }
  if (company.relevantExperience?.trim()) {
    legacy.push({ title: "Relevant experience", content: company.relevantExperience.trim() });
  }
  return legacy;
}

export function renderSectionContent(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const lines = content
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  if (lines.length > 1 && paragraphs.length <= 1) {
    return { type: "list" as const, items: lines };
  }

  return { type: "paragraphs" as const, items: paragraphs };
}
