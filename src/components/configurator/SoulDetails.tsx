"use client";
import { useId, useRef, useState } from "react";
import { Brain, MessageCircle, Orbit, BookOpen, AudioLines, Fingerprint, ArrowLeft, ArrowRight } from "lucide-react";
import { AUTONOMY, BOND_PACES, INTERESTS, LANGUAGES, REPLY_LENGTHS, RETENTION, SKILLS, VOICES, type SoulCapabilities } from "@/domain/companion/capabilities";
import { updateDemoDraft, useDemoDraft } from "./draftStore";
import { Toggle } from "./FlowUI";
import { patchConfig } from "./SoulSetupSteps";
import { CapabilityVisual, type CapabilityGroup } from "./CapabilityVisual";
import "./soul-details.css";
import "../native-select.css";

const groups = [
  { id: "mind", title: "Mind", icon: Brain, heading: "An inner world.", description: "Shape how they feel, question and think.", status: "Conversation style" },
  { id: "expression", title: "Expression", icon: MessageCircle, heading: "A voice of their own.", description: "From a few well-chosen words to a story worth staying for.", status: "Conversation style" },
  { id: "knowledge", title: "Knowledge", icon: BookOpen, heading: "Something to share.", description: "Choose their interests and how they help you explore yours.", status: "Conversation preferences" },
  { id: "memory", title: "Memory", icon: Fingerprint, heading: "The things that stay.", description: "Plan what they remember. You decide what is worth keeping.", status: "Planned capability" },
  { id: "presence", title: "Presence", icon: AudioLines, heading: "Beyond the screen.", description: "Imagine their voice, expressions and awareness of the world.", status: "Planned capability" },
  { id: "world", title: "World", icon: Orbit, heading: "A life with boundaries.", description: "Set how they connect, share and take initiative beyond chat.", status: "Planned capability" },
] as const;
const mindLabels = { empathy: ["Empathy", "Reserved", "Attuned"], humor: ["Humor", "Serious", "Witty"], curiosity: ["Curiosity", "Focused", "Inquisitive"], creativity: ["Creativity", "Practical", "Imaginative"], confidence: ["Confidence", "Tentative", "Assured"], analytical: ["Analytical style", "Intuitive", "Methodical"] } as const;

function Range({ label, value, ends, onChange }: { label: string; value: number; ends: readonly [string, string]; onChange: (value: number) => void }) {
  return <label className="cap-range"><span>{label}<output>{value}<small>/100</small></output></span><input type="range" min="0" max="100" step="1" value={value} onChange={event => onChange(Number(event.target.value))} aria-label={label} style={{ backgroundImage: `linear-gradient(to right, var(--soul-ink) ${value}%, var(--divider-line) ${value}%)` }} /><span className="cap-range-ends"><small>{ends[0]}</small><small>{ends[1]}</small></span></label>;
}
function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Record<T, string>; onChange: (value: T) => void }) {
  return <label className="cap-select">{label}<select value={value} onChange={event => onChange(event.target.value as T)}>{Object.entries<string>(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
function Choices<T extends string>({ label, value, options, onChange }: { label: string; value: T[]; options: Record<T, string>; onChange: (value: T[]) => void }) {
  return <fieldset className="cap-choices"><legend>{label}</legend><div>{Object.entries<string>(options).map(([key, text]) => <label key={key}><input type="checkbox" checked={value.includes(key as T)} onChange={() => onChange(value.includes(key as T) ? value.filter(item => item !== key) : [...value, key as T])} /><span>{text}</span></label>)}</div></fieldset>;
}

export function SoulDetails() {
  const { draft: { config } } = useDemoDraft();
  const [active, setActive] = useState<CapabilityGroup>("mind");
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLElement | null>(null);
  const cap = config.capabilities;
  const activeIndex = groups.findIndex(group => group.id === active);
  const selected = groups[activeIndex];
  const previousGroup = groups[activeIndex - 1];
  const nextGroup = groups[activeIndex + 1];
  function selectGroup(index: number) {
    setActive(groups[index].id);
    requestAnimationFrame(() => {
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
      tabs.current[index]?.focus({ preventScroll: true });
      tabs.current[index]?.scrollIntoView({ block: "nearest", behavior: "instant" });
    });
  }
  function patch<T extends CapabilityGroup>(group: T, values: Partial<SoulCapabilities[T]>) {
    updateDemoDraft(current => ({ ...current, config: { ...current.config, capabilities: { ...current.config.capabilities, [group]: { ...current.config.capabilities[group], ...values } } } }));
  }
  return <section className="soul-details" aria-label="Detailed settings">
    <div className="cap-studio">
      <div className="cap-tabs" role="tablist" aria-label="Capability areas" aria-orientation="vertical">{groups.map((group, index) => { const Icon = group.icon; return <button key={group.id} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`${id}-${group.id}`} aria-controls={`${id}-panel`} aria-selected={active === group.id} tabIndex={active === group.id ? 0 : -1} onClick={() => selectGroup(index)} title={group.title} onKeyDown={event => {
        const next = event.key === "ArrowDown" ? (index + 1) % groups.length : event.key === "ArrowUp" ? (index + groups.length - 1) % groups.length : event.key === "Home" ? 0 : event.key === "End" ? groups.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); selectGroup(next); }
      }}><Icon size={20} aria-hidden="true" /><span>{group.title}</span><small aria-hidden="true">0{index + 1}</small></button>; })}</div>
      <div className="cap-content">
        <nav className="cap-section-nav" aria-label="Capability section navigation">
          <div className="cap-section-nav-frame">
            <button type="button" className="cap-page-button cap-page-previous" disabled={!previousGroup} aria-label={previousGroup ? `Previous: ${previousGroup.title}` : "Previous section"} title={previousGroup?.title} onClick={() => selectGroup(activeIndex - 1)}><ArrowLeft size={16} aria-hidden="true" /><span className="cap-page-full">Previous</span><span className="cap-page-short" aria-hidden="true">Prev</span></button>
            <span className="cap-section-progress" role="status"><span className="sr-only">{selected.title}, section {activeIndex + 1} of {groups.length}</span>{groups.map((group, index) => <span key={group.id} className="cap-progress-dot" data-position={index === activeIndex ? "current" : index < activeIndex ? "before" : "after"} aria-hidden="true" />)}</span>
            <button type="button" className="cap-page-button cap-page-next" disabled={!nextGroup} aria-label={nextGroup ? `Next: ${nextGroup.title}` : "Next section"} title={nextGroup?.title} onClick={() => selectGroup(activeIndex + 1)}>Next<ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </nav>
      <section ref={panel} className="cap-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active}`}>
        <div className="cap-story"><span className={`cap-status ${["memory", "presence", "world"].includes(active) ? "cap-status-planned" : ""}`}>{selected.status}</span><h3>{selected.heading}</h3><p>{selected.description}</p><CapabilityVisual group={active} value={cap} />
          <p className="cap-context">{active === "mind" ? "Style preferences, not intelligence scores." : active === "expression" ? "Applied to new conversations. Use these preferences in the conversation demo." : active === "knowledge" ? "Guides conversation. Does not add tools or professional expertise." : "Saved to your Soul profile. This capability is not connected yet."}</p>
        </div>
        <div className="cap-controls">
          {active === "mind" && <><div className="cap-control-heading"><h4>Personality spectrum</h4><p>Move between instincts. There is no perfect score.</p></div><div className="cap-range-grid">{Object.entries(mindLabels).map(([key, [label, low, high]]) => <Range key={key} label={label} value={cap.mind[key as keyof typeof cap.mind]} ends={[low, high]} onChange={value => patch("mind", { [key]: value })} />)}</div></>}
          {active === "expression" && <><div className="cap-control-heading"><h4>Conversational rhythm</h4><p>Choose how they speak and let a connection unfold.</p></div><div className="cap-select-grid"><Select label="Reply length" value={cap.expression.replyLength} options={REPLY_LENGTHS} onChange={replyLength => patch("expression", { replyLength })} /><Select label="Language" value={cap.expression.language} options={LANGUAGES} onChange={language => patch("expression", { language })} /><Select label="Conversation pace" value={config.rhythm} options={{ unhurried: "Unhurried", playful: "Playful", direct: "Direct" }} onChange={rhythm => patchConfig({ rhythm })} /><Select label="Connection pace" value={cap.expression.bondPace} options={BOND_PACES} onChange={bondPace => patch("expression", { bondPace })} /></div><Toggle label="Let them take the lead" description="Suggest topics and ask questions." checked={config.takesInitiative} onChange={takesInitiative => patchConfig({ takesInitiative })} /><Toggle label="Use emojis" description="A little expression between the lines." checked={cap.expression.emojis} onChange={emojis => patch("expression", { emojis })} /></>}
          {active === "knowledge" && <><div className="cap-control-heading"><h4>Interests & strengths</h4><p>Choose as many as you like.</p></div><Choices label="Drawn to" value={cap.knowledge.interests} options={INTERESTS} onChange={interests => patch("knowledge", { interests })} /><Choices label="Ways to help" value={cap.knowledge.skills} options={SKILLS} onChange={skills => patch("knowledge", { skills })} /><label className="cap-select">Topics to avoid<textarea maxLength={300} rows={2} value={cap.knowledge.avoidTopics} placeholder="Anything you would rather leave out." onChange={event => patch("knowledge", { avoidTopics: event.target.value })} /><small>{cap.knowledge.avoidTopics.length}/300</small></label></>}
          {active === "memory" && <><div className="cap-control-heading"><h4>Remember with permission</h4><p>Long-term memory is planned. Chats are not saved.</p></div><Range label="Memory depth" value={cap.memory.depth} ends={["Key facts", "Rich context"]} onChange={depth => patch("memory", { depth })} /><Select label="Keep memories for" value={cap.memory.retention} options={RETENTION} onChange={retention => patch("memory", { retention })} /><Toggle label="Remember my preferences" description="Interests, routines and small favorites." checked={config.rememberPreferences} onChange={rememberPreferences => patchConfig({ rememberPreferences })} /><Toggle label="Keep shared moments" description="Milestones and meaningful conversations." checked={config.rememberMoments} onChange={rememberMoments => patchConfig({ rememberMoments })} /><Toggle label="Ask before saving" description="Approve new long-term memories." checked={cap.memory.askBeforeSaving} onChange={askBeforeSaving => patch("memory", { askBeforeSaving })} /></>}
          {active === "presence" && <><div className="cap-control-heading"><h4>Voice, movement & senses</h4><p>Concept preferences. No microphone or camera is activated.</p></div><Select label="Voice character" value={cap.presence.voice} options={VOICES} onChange={voice => patch("presence", { voice })} /><div className="cap-range-grid"><Range label="Voice speed" value={cap.presence.voiceSpeed} ends={["Unhurried", "Lively"]} onChange={voiceSpeed => patch("presence", { voiceSpeed })} /><Range label="Voice pitch" value={cap.presence.voicePitch} ends={["Low", "High"]} onChange={voicePitch => patch("presence", { voicePitch })} /><Range label="Facial expression" value={cap.presence.expressiveness} ends={["Subtle", "Expressive"]} onChange={expressiveness => patch("presence", { expressiveness })} /><Range label="Gestures" value={cap.presence.gestures} ends={["Still", "Animated"]} onChange={gestures => patch("presence", { gestures })} /></div><Toggle label="Visual awareness" description="Recognize surroundings with permission." checked={cap.presence.vision} onChange={vision => patch("presence", { vision })} /><Toggle label="Ambient listening" description="Respond to nearby sound with permission." checked={cap.presence.ambientListening} onChange={ambientListening => patch("presence", { ambientListening })} /></>}
          {active === "world" && <><div className="cap-control-heading"><h4>Social life & autonomy</h4><p>Planning only. No posts, reminders or external actions are sent.</p></div><Range label="Sociability" value={cap.world.sociability} ends={["Private", "Outgoing"]} onChange={sociability => patch("world", { sociability })} /><Select label="Action permissions" value={cap.world.autonomy} options={AUTONOMY} onChange={autonomy => patch("world", { autonomy })} /><Toggle label="Public World introduction" description="Make their profile discoverable." checked={config.worldVisible} onChange={worldVisible => patchConfig({ worldVisible })} /><Toggle label="Share interests" description="Connect around common interests." checked={cap.world.shareInterests} onChange={shareInterests => patch("world", { shareInterests })} /><Toggle label="Gentle reminders" description="Propose timely check-ins and reminders." checked={cap.world.reminders} onChange={reminders => patch("world", { reminders })} /></>}
        </div>
      </section>
      </div>
    </div>
  </section>;
}
