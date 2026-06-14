import { BRAND } from "@/data/site";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-hairline">
      <div className="mx-auto flex max-w-[1248px] items-center justify-between px-6 py-11 lg:px-0">
        <div className="flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] bg-vessel" aria-hidden />
          <span className="font-display text-[13px] font-semibold text-ink">
            {BRAND}
          </span>
        </div>
        <p className="font-signal text-[10px] tracking-[0.12em] text-steel">
          {BRAND.toUpperCase()} · PRIVATE BY DESIGN ·{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
