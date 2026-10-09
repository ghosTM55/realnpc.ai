"use client";

import { Heart, Users, Handshake } from "lucide-react";
import { STEP } from "@/data/configuratorSteps";
import { getSoul, PERSONALITY_LABELS, PERSONALITY_STYLES, RELATIONSHIPS, SOULS, SOUL_IDENTITIES, type CompanionConfig } from "@/domain/companion/model";
import { updateDemoDraft, useDemoDraft } from "./draftStore";
import { OptionGroup, optionsOf } from "./FlowUI";
import { SoulPortrait } from "./SoulPortrait";

export const RELATIONSHIP_COPY = {
  friends: { label: "With friends", icon: Users },
  strangers: { label: "With strangers", icon: Handshake },
  partner: { label: "With a partner", icon: Heart },
};
export const PERSONALITY_PREVIEWS = {
  warm: "You don't have to have it all figured out. I'm happy to listen.",
  playful: "A tiny adventure? You pick the direction. I'll bring the questionable ideas.",
  thoughtful: "Tell me the part you've been turning over in your mind. We can take our time.",
  direct: "Would you like an honest opinion, a practical plan, or just some company?",
};
export function patchConfig(patch: Partial<CompanionConfig>) {
  updateDemoDraft(current => ({ ...current, config: { ...current.config, ...patch } }));
}

export default function SoulSetupSteps({ step }: { step: number }) {
  const { draft: { config } } = useDemoDraft();
  if (step === STEP.personality) return <section aria-label="Relationship personalities" className="soul-personalities">
    {RELATIONSHIPS.map((relationship, index) => {
      const { label, icon: Icon } = RELATIONSHIP_COPY[relationship];
      return <div className="soul-personality-row" key={relationship}>
        <div className="soul-relation-title"><span className="soul-line-icon"><Icon size={22} /></span><div><span className="soul-kicker">0{index + 1}</span><h2>{label}</h2></div></div>
        <div><OptionGroup label={`${label} personality`} compact value={config.personality[relationship]} options={optionsOf(PERSONALITY_STYLES, PERSONALITY_LABELS)} onChange={style => patchConfig({ personality: { ...config.personality, [relationship]: style } })} />
          <p className="soul-sample" role="status">“{PERSONALITY_PREVIEWS[config.personality[relationship]]}”</p>
        </div>
      </div>;
    })}
    <p className="soul-caption">Sample replies. Your choices shape the conversation.</p>
  </section>;

  const soul = getSoul(config.soulId);
  const identity = SOUL_IDENTITIES[config.soulId];
  return <section className="soul-casting" aria-label="Character selection">
    <div className="soul-casting-portrait">
      <SoulPortrait soulId={soul.id} />
      <span className="soul-casting-index" aria-hidden>{String(SOULS.indexOf(soul) + 1).padStart(2, "0")} / 03</span>
    </div>
    <div className="soul-casting-profile" aria-live="polite" aria-atomic="true">
      <p className="soul-kicker">{soul.archetype}</p>
      <h2>{soul.name}</h2>
      <p className="soul-casting-meta">{identity.age} · {identity.gender === "female" ? "Female" : "Male"}</p>
      <p className="soul-casting-story">{identity.background}</p>
    </div>
    <fieldset className="soul-roster">
      <legend className="sr-only">Choose a character</legend>
      <div className="soul-roster-list">{SOULS.map(character => <label key={character.id} className="soul-roster-option">
        <input type="radio" name="soul" aria-label={character.name} checked={config.soulId === character.id} onChange={() => patchConfig({ soulId: character.id, name: "", ...SOUL_IDENTITIES[character.id] })} />
        <span className="soul-roster-tile"><SoulPortrait soulId={character.id} /><span className="soul-roster-name">{character.name}</span><span className="soul-roster-status">{config.soulId === character.id ? "Selected" : ""}</span></span>
      </label>)}</div>
    </fieldset>
  </section>;
}
