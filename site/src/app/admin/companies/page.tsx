import { CompanyAdmin } from "@/components/company-admin";
import { parseTalkingPoints, resolveCompanySections } from "@/lib/company-page";
import { getRootDomain } from "@/lib/root-domain";
import { db } from "@/lib/db";

export default async function AdminCompaniesPage() {
  const [companies, rootDomain] = await Promise.all([
    db.companyPage.findMany({ orderBy: { createdAt: "desc" } }),
    Promise.resolve(getRootDomain()),
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-2">Company pages</h1>
      <p className="text-muted mb-8">
        Create tailored application pages at subdomains like housejudiciary.{rootDomain}.
      </p>
      <CompanyAdmin
        companies={companies.map((company) => ({
          ...company,
          sections: resolveCompanySections(company),
          talkingPoints: parseTalkingPoints(company.talkingPoints),
        }))}
        rootDomain={rootDomain}
      />
    </div>
  );
}
