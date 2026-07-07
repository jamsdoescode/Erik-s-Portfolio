import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeader({ title, href, linkLabel = "See more" }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 border-b border-rule pb-4">
      <h2 className="section-heading">{title}</h2>
      {href && (
        <Link href={href} className="text-link text-sm shrink-0">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
