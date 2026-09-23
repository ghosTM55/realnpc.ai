"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { CONFIG_CTA_HREF, CONFIG_CTA_LABEL, NAV_LINKS } from "@/data/site";
import BrandLogo from "@/components/BrandLogo";

export default function Nav() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const router = useRouter();
  const prefetchDestination = (href: string) => {
    if (href !== pathname) router.prefetch(href);
  };
  const inLab = pathname === "/companion-lab";
  const inCompanionFlow = inLab || pathname === "/configurator";

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[72px] border-b border-hairline bg-paper shadow-[0_1px_20px_rgba(21,24,29,0.045)]">
      <nav className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-24">
        <Link href="/" prefetch={false}
          onMouseEnter={() => prefetchDestination("/")}
          onFocus={() => prefetchDestination("/")}
          className="flex min-h-11 shrink-0 items-center" aria-label="RealNPC home">
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-3 lg:gap-6">
          <ul className="hidden items-center gap-2 md:flex lg:gap-5">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : !link.href.startsWith("#") && pathname === link.href;

              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    onMouseEnter={() => prefetchDestination(link.href)}
                    onFocus={() => prefetchDestination(link.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-[4px] border px-3 font-nav text-[13px] font-semibold tracking-[0.025em] transition-colors ${
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
          {!inCompanionFlow && <Link
            href={CONFIG_CTA_HREF}
            aria-label={CONFIG_CTA_LABEL}
            className="flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[4px] bg-vessel px-3 py-2.5 font-nav text-xs font-semibold tracking-[0.025em] text-white transition-opacity hover:opacity-90 min-[360px]:px-4"
          >
            <span>{CONFIG_CTA_LABEL}</span>
            <SlidersHorizontal size={13} />
          </Link>}
        </div>
      </nav>
    </header>
  );
}
