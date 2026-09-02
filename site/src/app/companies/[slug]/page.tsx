import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyTldr } from "@/components/company-tldr";
import { SiteShell } from "@/components/site-shell";
import { parseTalkingPoints, renderSectionContent, resolveCompanySections } from "@/lib/company-page";
import { getSiteConfig } from "@/lib/content";
import { db } from "@/lib/db";

type CompanyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await db.companyPage.findUnique({ where: { slug } });

  if (!company || !company.published) {
    return { title: "Not found" };
  }

  return {
    title: `${company.roleTitle} · ${company.orgName}`,
    description: company.heroHeadline,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const [company, site] = await Promise.all([
    db.companyPage.findUnique({ where: { slug } }),
    getSiteConfig(),
  ]);

  if (!company || !company.published) {
    notFound();
  }

  const talkingPoints = parseTalkingPoints(company.talkingPoints);
  const sections = resolveCompanySections(company);

  return (
    <SiteShell site={site} narrow hideNav>
      <article className="company-article">
        <header className="article-header company-article-header">
          <div className="article-header-top">
            <p className="doc-meta">{company.orgName}</p>
            <CompanyTldr slug={slug} talkingPoints={talkingPoints} />
          </div>
          <h1 className="article-title">{company.heroHeadline}</h1>
          <p className="page-intro company-article-role">{company.roleTitle}</p>
        </header>

        {sections.length > 0 && (
          <div className="prose-gallery company-article-body">
            {sections.map((section) => {
              const rendered = renderSectionContent(section.content);

              return (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {rendered.type === "list" ? (
                    <ul>
                      {rendered.items.map((item) => (
                        <li key={item.slice(0, 40)}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    rendered.items.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)
                  )}
                </section>
              );
            })}
          </div>
        )}
      </article>
    </SiteShell>
  );
}
