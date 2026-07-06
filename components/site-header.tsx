"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { glassStyle } from "@/components/glass-style";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

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

            return (
              <Link key={item.href} href={item.href} data-active={active} aria-current={active ? "page" : undefined}>
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
