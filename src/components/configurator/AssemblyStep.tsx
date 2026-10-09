"use client";
import Image from "next/image";
import { Cpu, Sparkles, Wrench } from "lucide-react";
import hardware from "@/media/soul/hardware.webp";
import { ASSEMBLIES, ASSEMBLY_LABELS, type CompanionConfig } from "@/domain/companion/model";
import { patchConfig } from "./SoulSetupSteps";
import pureSoul from "@/media/soul/pure-soul.webp";
import "./soul-assembly.css";

export default function AssemblyStep({ config }: { config: CompanionConfig }) {
  const description = {
    software: "Your character, in conversation. No hardware required.",
    preset: "Your Soul in a ready-made companion robot.",
    custom: "A bespoke body, appearance and expressions for your Soul.",
  };
  const icons = { software: Sparkles, preset: Cpu, custom: Wrench };
  return <fieldset className="soul-assembly"><legend className="sr-only">Assembly method</legend><div className="soul-assembly-grid">{ASSEMBLIES.map((assembly, index) => {
    const Icon = icons[assembly];
    return <label className="soul-assembly-choice" key={assembly}><input type="radio" name="assembly" aria-label={ASSEMBLY_LABELS[assembly]} checked={config.assembly === assembly} onChange={() => patchConfig({ assembly, form: assembly === "software" ? "digital-human" : "robot" })} />
      <span className="soul-assembly-content"><span className={`soul-assembly-art ${assembly === "software" ? "soul-software-art" : ""}`}>{assembly === "software" ? <Image src={pureSoul} unoptimized alt="A human presence formed from light and flowing threads, without a physical body" className="soul-software-image" /> : <Image src={hardware} unoptimized alt={assembly === "preset" ? "Concept of a white desktop companion robot" : "Concept of a bespoke humanoid with exposed neck engineering"} className="soul-hardware-sheet" style={{ left: assembly === "preset" ? "0" : "-100%" }} />}</span>
        <span className="soul-assembly-copy"><span className="soul-assembly-meta"><Icon size={19} /><small>{assembly === "software" ? "SOFTWARE" : "COMING SOON"}</small><span className="soul-selection-mark" aria-hidden>{config.assembly === assembly ? "Selected" : ""}</span></span><strong><span className="soul-kicker">0{index + 1}</span>{ASSEMBLY_LABELS[assembly]}</strong><span>{description[assembly]}</span><small className="soul-caption">{assembly === "software" ? "Text Chat" : "Concept Design"}</small></span>
      </span></label>;
  })}</div><p className="soul-caption mt-4">All options include chat. Hardware selections are preferences, not orders.</p></fieldset>;
}
