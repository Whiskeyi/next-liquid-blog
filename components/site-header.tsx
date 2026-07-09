"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";
import { Code2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { glassStyle } from "@/components/glass-style";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (href !== pathname) setPendingHref(href);
  }

  return (
    <header className="site-header">
      <nav className="glass-nav" style={glassStyle} aria-label="主导航">
        <Link className="brand" href="/" aria-label={`${siteConfig.name} 首页`}>
          <span className="brand-mark" aria-hidden="true">
            ZHUCHJ
          </span>
        </Link>
        <div className="nav-links">
          {siteConfig.navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const pending = pendingHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                data-pending={pending}
                aria-current={active ? "page" : undefined}
                onClick={(event) => handleNavigationClick(event, item.href)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="nav-actions">
          <a
            className="icon-button"
            href={siteConfig.links.repository}
            target="_blank"
            rel="noreferrer"
            aria-label="博客源码 GitHub 仓库"
          >
            <Code2 size={18} />
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
