import { SoulPortrait } from "@/components/configurator/SoulPortrait";
import { Heart } from "lucide-react";
import { CONNECTION_LABELS, CONNECTION_STAGES } from "@/domain/companion/chat";
import { getSoulName, PERSONALITY_LABELS, type CompanionConfig, type Relationship } from "@/domain/companion/model";
import { INTERESTS } from "@/domain/companion/capabilities";

export function SoulChatProfile({ config, relationship, hasConversation, moodLabel }: { config: CompanionConfig; relationship: Relationship; hasConversation: boolean; moodLabel: string }) {
  const name = getSoulName(config);
  const { knowledge } = config.capabilities;
  const hearts = hasConversation ? CONNECTION_STAGES.indexOf(relationship) + 1 : 0;
  return <>
    <div className="chat-profile-heading"><h2>About {name}</h2></div>
    <div className="chat-profile-person"><SoulPortrait soulId={config.soulId} className="chat-avatar chat-profile-avatar" /><div><strong>{name}</strong><p>{config.age} · {config.gender === "female" ? "Female" : config.gender === "male" ? "Male" : "Non-binary"}</p></div></div>
    <p className="chat-profile-background">{config.background}</p>
    <section className="chat-profile-section chat-connection" aria-labelledby="chat-connection-label"><h3 id="chat-connection-label">Your connection</h3>
      <div className="chat-connection-level"><span className="chat-hearts" role="img" aria-label={`Closeness: ${hearts} of 3 hearts`}>{CONNECTION_STAGES.map((stage, index) => <Heart key={stage} size={22} strokeWidth={1.5} data-filled={index < hearts} aria-hidden />)}</span><span>{hasConversation ? CONNECTION_LABELS[relationship] : "Just meeting"}</span></div>
      <p className="chat-mood"><span>Right now</span><strong>{moodLabel}</strong></p>
    </section>
    <section className="chat-profile-section" aria-labelledby="chat-personality-label"><h3 id="chat-personality-label">Personality</h3><dl className="chat-personality-list">{CONNECTION_STAGES.map(stage => <div key={stage} data-current={stage === relationship}><dt>{CONNECTION_LABELS[stage]}{stage === relationship && <span>Current</span>}</dt><dd>{PERSONALITY_LABELS[config.personality[stage]]}</dd></div>)}</dl></section>
    {knowledge.interests.length > 0 && <section className="chat-profile-section"><h3>Interests</h3><ul className="chat-interest-list">{knowledge.interests.map(interest => <li key={interest}>{INTERESTS[interest]}</li>)}</ul></section>}
    {knowledge.avoidTopics && <section className="chat-profile-section"><h3>Topics to avoid</h3><p className="chat-profile-boundaries">{knowledge.avoidTopics}</p></section>}
  </>;
}
