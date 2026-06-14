"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, SlidersHorizontal, User } from "lucide-react";
import { BRAND, CONFIG_CTA_LABEL, NAV_LINKS } from "@/data/site";

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[72px] border-b border-hairline bg-paper shadow-[0_1px_20px_rgba(21,24,29,0.045)]">
      <nav className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-24">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] bg-vessel" aria-hidden />
          <span className="font-display text-[13px] font-semibold text-ink">
            {BRAND}
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : !link.href.startsWith("#") && pathname === link.href;

              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex h-8 items-center rounded-[4px] border px-3 font-signal text-[11px] transition-colors ${
                      isActive
                        ? "border-vessel/35 bg-vessel-tint text-ink"
                        : "border-transparent text-steel hover:border-hairline hover:bg-white hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/configurator"
            className="flex items-center gap-2 rounded-[4px] bg-vessel px-4 py-2.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {CONFIG_CTA_LABEL}
            <SlidersHorizontal size={13} />
          </Link>
          {/* Reserved: account + language dropdowns (menus wired up later) */}
          <div className="flex items-center gap-1 border-l border-hairline pl-4">
            <button
              type="button"
              aria-label="Account"
              aria-haspopup="menu"
              className="flex items-center gap-0.5 rounded-[4px] p-1.5 text-steel transition-colors hover:text-ink"
            >
              <User size={16} />
              <ChevronDown size={12} />
            </button>
            <button
              type="button"
              aria-label="Language"
              aria-haspopup="menu"
              className="flex items-center gap-0.5 rounded-[4px] p-1.5 text-steel transition-colors hover:text-ink"
            >
              <Globe size={16} />
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
