import Image from "next/image";
import portraits from "@/media/soul/portraits.webp";
import type { SoulId } from "@/domain/companion/model";

export function SoulPortrait({ soulId, className = "" }: { soulId: SoulId; className?: string }) {
  const index = { anchor: 0, scout: 1, instigator: 2 }[soulId];
  return <span className={`soul-portrait ${className}`} aria-hidden="true">
    <Image src={portraits} alt="" unoptimized className="soul-portrait-sheet" style={{ left: `${index * -100}%` }} />
  </span>;
}
