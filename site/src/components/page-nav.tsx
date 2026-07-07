import Link from "next/link";
import { cn } from "@/lib/utils";

type PageNavLink = {
  href: string;
  label: string;
};

type PageNavProps = {
  top?: PageNavLink;
  bottom?: PageNavLink[];
  className?: string;
};

export function PageNav({ top, bottom, className }: PageNavProps) {
  return (
    <nav className={cn("page-nav", className)}>
      {top && (
        <div className="page-nav-top">
          <Link href={top.href} className="page-nav-link">
            {top.label}
          </Link>
        </div>
      )}
      {bottom && bottom.length > 0 && (
        <div className="page-nav-bottom">
          {bottom.map((link) => (
            <Link key={link.href} href={link.href} className="page-nav-link">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
