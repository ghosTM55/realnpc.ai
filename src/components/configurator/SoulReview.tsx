"use client";
import { ArrowUpRight, Brain, MessageCircle, BookOpen, Fingerprint, AudioLines, Orbit, Cpu } from "lucide-react";
import { STEP } from "@/data/configuratorSteps";
import { ASSEMBLY_LABELS, getSoulName, PERSONALITY_LABELS, RELATIONSHIPS, type CompanionConfig } from "@/domain/companion/model";
import { INTERESTS, LANGUAGES, REPLY_LENGTHS, VOICES } from "@/domain/companion/capabilities";
import { RELATIONSHIP_COPY } from "./SoulSetupSteps";
import { SoulPortrait } from "./SoulPortrait";
import "./soul-review.css";

export default function SoulReview({ config, onEdit }: { config: CompanionConfig; onEdit: (step: number) => void }) {
  const name = getSoulName(config);
  const cap = config.capabilities;
  return <div className="soul-final-review">
    <aside className="soul-review-image"><SoulPortrait soulId={config.soulId} className="soul-review-portrait" /><span>YOUR SOUL / {name.toUpperCase()}</span><button type="button" className="soul-text-button" onClick={() => onEdit(STEP.soul)}>Change character <ArrowUpRight size={15} /></button></aside>
    <section className="soul-review-profile" aria-label="Soul profile">
      <p className="soul-kicker">THE CHARACTER YOU SHAPED</p><h2>{name}</h2><p className="soul-caption">{config.age} · {config.gender === "nonbinary" ? "Non-binary" : config.gender === "female" ? "Female" : "Male"}</p><p className="soul-review-background">{config.background}</p>
      <section className="soul-review-section"><div className="soul-review-section-heading"><h3>How you connect</h3><button type="button" onClick={() => onEdit(STEP.personality)} aria-label="Edit personality">Edit <ArrowUpRight size={13} /></button></div><dl className="soul-review-personalities">{RELATIONSHIPS.map(key => <div key={key}><dt>{RELATIONSHIP_COPY[key].label}</dt><dd>{PERSONALITY_LABELS[config.personality[key]]}</dd></div>)}</dl></section>
      <section className="soul-review-section"><div className="soul-review-section-heading"><h3>Assembly</h3><button type="button" onClick={() => onEdit(STEP.presence)} aria-label="Edit assembly">Edit <ArrowUpRight size={13} /></button></div><p className="soul-review-assembly"><Cpu size={20} />{ASSEMBLY_LABELS[config.assembly]}<small>{config.assembly === "software" ? "Software" : "Coming soon"}</small></p></section>
      <section className="soul-review-section"><div className="soul-review-section-heading"><h3>Capability profile</h3><button type="button" onClick={() => onEdit(STEP.details)} aria-label="Edit capabilities">Edit <ArrowUpRight size={13} /></button></div>
        <div className="soul-review-capabilities">
          <div><Brain size={18} /><p><strong>Mind</strong><span>Empathy {cap.mind.empathy} · Curiosity {cap.mind.curiosity} · Creativity {cap.mind.creativity}</span></p></div>
          <div><MessageCircle size={18} /><p><strong>Expression</strong><span>{REPLY_LENGTHS[cap.expression.replyLength]} replies · {LANGUAGES[cap.expression.language]}</span></p></div>
          <div><BookOpen size={18} /><p><strong>Interests</strong><span>{cap.knowledge.interests.map(key => INTERESTS[key]).join(" · ") || "Open to discovery"}</span></p></div>
          <div><Fingerprint size={18} /><p><strong>Memory <small>Planned</small></strong><span>{config.rememberPreferences || config.rememberMoments ? [config.rememberPreferences && "Preferences", config.rememberMoments && "Shared moments"].filter(Boolean).join(" · ") : "No long-term memories"}</span></p></div>
          <div><AudioLines size={18} /><p><strong>Presence <small>Planned</small></strong><span>{VOICES[cap.presence.voice]} voice · {cap.presence.expressiveness > 60 ? "Expressive" : "Subtle"} expressions</span></p></div>
          <div><Orbit size={18} /><p><strong>World <small>Planned</small></strong><span>{config.worldVisible ? "Public introduction" : "Private profile"} · {cap.world.reminders ? "Reminders on" : "No reminders"}</span></p></div>
        </div>
      </section>
      <p className="soul-review-next">Next: meet {name} in a conversation shaped by your settings.</p>
    </section>
  </div>;
}
