import Link from "next/link";
import { GithubLogo, LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import type { SiteConfig } from "@/lib/content";

type SocialLinksProps = {
  links: SiteConfig["links"];
};

const iconForLabel = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("github")) return GithubLogo;
  if (key.includes("linkedin")) return LinkedinLogo;
  if (key.includes("email") || key.includes("mail")) return EnvelopeSimple;
  return null;
};

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="social-links">
      {links.map((link) => {
        const Icon = iconForLabel(link.label);
        if (!Icon) return null;

        return (
          <a
            key={link.href}
            href={link.href}
            className="social-link"
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={link.label}
          >
            <Icon size={18} weight="regular" />
          </a>
        );
      })}
    </div>
  );
}

export function emailFromLinks(links: SiteConfig["links"]) {
  return links.find((link) => link.label.toLowerCase().includes("email"))?.href.replace("mailto:", "");
}
