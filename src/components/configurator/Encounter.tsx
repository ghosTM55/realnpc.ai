"use client";

import { useEffect, useState } from "react";
import type { CompanionConfig } from "@/domain/companion/model";
import { getCompanionProfile } from "@/domain/companion/profile";
import { SoulSeal } from "./SoulSeal";

export function ScriptedReply({ text }: { text: string }) {
  const [length, setLength] = useState(42);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cursor = 42;
    const timer = window.setInterval(() => {
      cursor = Math.min(
        text.length,
        cursor + (reduced.matches ? text.length : 12),
      );
      setLength(cursor);
      if (cursor === text.length) window.clearInterval(timer);
    }, 35);
    return () => window.clearInterval(timer);
  }, [text]);
  return (
    <p className="text-[15px] leading-[1.75] text-ink">
      <span aria-hidden>
        {text.slice(0, length)}
        {length < text.length && (
          <span className="ml-0.5 inline-block h-4 w-1 bg-soul-ink motion-safe:animate-cursor-blink" />
        )}
      </span>
      <span className="sr-only">{text}</span>
    </p>
  );
}

export function NextEncounter({ config }: { config: CompanionConfig }) {
  const profile = getCompanionProfile(config);
  const encounter = profile.nextEncounter;
  return (
    <section
      aria-label="Your next encounter"
      className="border-y border-divider py-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="encounter-heading"
          tabIndex={-1}
          className="scroll-mt-24 text-sm font-semibold outline-none"
        >
          {encounter.title}
        </h2>
        <span className="text-xs text-steel">Scene preview</span>
      </div>
      <p className="mb-5 text-sm text-steel">You: “{encounter.prompt}”</p>
      <div className="flex items-start gap-4">
        <SoulSeal soulId={config.soulId} />
        <div>
          <p className="mb-2 text-sm font-semibold">{profile.soul.name}</p>
          <p className="max-w-[64ch] text-[15px] leading-[1.75]">
            {encounter.reply}
          </p>
        </div>
      </div>
    </section>
  );
}
