"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { PageCopy } from "@/lib/page-copy";

type SiteHeaderProps = {
  currentPath?: string;
  nav: PageCopy["nav"];
};

function isActive(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function SiteHeader({ currentPath = "/", nav }: SiteHeaderProps) {
  const [visible, setVisible] = useState(true);

  const navItems = [
    { href: "/about", label: nav.about },
    { href: "/reading", label: nav.reading },
    { href: "/projects", label: nav.projects },
    { href: "/blog", label: nav.blog },
  ];

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY <= 4);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("site-header", !visible && "site-header-hidden")}>
      <div className="site-container site-header-inner">
        <Link href="/" className="site-logo" id="site-home-logo" aria-label="Home">
          <Heart size={15} weight="fill" aria-hidden />
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("site-nav-link", isActive(currentPath, item.href) && "is-active")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
