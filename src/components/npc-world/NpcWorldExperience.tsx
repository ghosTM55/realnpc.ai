"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowRight, Bot, Check, ChevronDown, Clock3, Fingerprint, LockKeyhole, MapPin, MonitorUp, Pause, Play, RotateCcw, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";
import NpcWorldHero from "./NpcWorldHero";
import { useSceneActivity, useWorldPlayback } from "./useWorldPlayback";
import { NPC_WORLD_PAGE, WORLD_SCENARIOS, getScenario, permissionCapabilities, type PermissionId, type ScenarioId, type StoryEnding, type WorldScenario } from "@/data/npcWorldPage";
import type { WorldNpc } from "@/data/npcWorld";
import { FlowSurface } from "@/components/FlowBackground";

export default function NpcWorldExperience() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("leisure");
  const scenario = getScenario(scenarioId);

  return (
    <div className="npc-world text-ink">
      <NpcWorldHero scenario={scenario} onScenarioChange={setScenarioId} />
      <section id="encounter" className="flow-surface npc-section scroll-mt-[72px] bg-ink text-paper">
        <FlowSurface />
        <div className="npc-container">
          <SectionHeading {...NPC_WORLD_PAGE.encounter} inverse />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
            <div className="npc-scenario-tabs" aria-label="Choose a story">
              {WORLD_SCENARIOS.map((item) => (
                <button key={item.id} type="button" aria-pressed={item.id === scenario.id} data-scenario={item.id}
                  onClick={() => setScenarioId(item.id)} className="npc-scenario-tab">
                  {item.label}
                </button>
              ))}
            </div>
            <span className="npc-eyebrow hidden text-paper/65 sm:inline">ILLUSTRATED STORY</span>
          </div>
          <Encounter key={scenario.id} scenario={scenario} />
        </div>
      </section>
      <PrivacyExchange key={"permissions-" + scenario.id} scenario={scenario} />
      <ContinuityPayoff key={"continuity-" + scenario.id} scenario={scenario} />
      <WorldChoice />
      <section className="npc-section relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full border border-soul/20" aria-hidden />
        <div className="npc-container relative">
          <p className="npc-eyebrow npc-section-kicker">{NPC_WORLD_PAGE.close.kicker}</p>
          <h2 className="npc-section-title mt-5">
            <span className="hidden md:inline">{NPC_WORLD_PAGE.close.title}</span>
            <span className="md:hidden">{NPC_WORLD_PAGE.close.mobileTitle}</span>
          </h2>
        </div>
      </section>
    </div>
  );
}

function Encounter({ scenario }: { scenario: WorldScenario }) {
  const readingRef = useRef<HTMLDivElement>(null);
  const { active } = useSceneActivity(readingRef, 0.65);
  const playback = useWorldPlayback(scenario, active);
  const [ending, setEnding] = useState<StoryEnding>("accepted");
  const step = scenario.steps[playback.index];
  const declined = playback.finished && ending === "declined";
  const PlaybackIcon = playback.finished ? RotateCcw : playback.paused ? Play : Pause;

  return (
    <div className="npc-encounter mt-7" data-step={playback.index} data-playing={playback.playing}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/15 px-5 py-4 sm:px-8">
        <p className="npc-eyebrow flex items-center gap-2 text-paper/75"><MapPin size={13} />{scenario.city} <span className="hidden sm:inline">· {scenario.time}</span></p>
        <button type="button" className="npc-playback-button" onClick={playback.toggle}
          aria-label={playback.finished ? "Replay story" : playback.paused ? "Resume story" : "Pause story"}>
          <PlaybackIcon size={14} />
          {playback.finished ? "Replay" : playback.paused ? "Continue" : "Pause"}
        </button>
      </div>

      <div ref={readingRef} className="npc-story-layout">
        <div className="npc-story-reading">
          <div className="npc-step-nav" aria-label="Story progress">
            {scenario.steps.map((item, index) => (
              <button key={item.label} type="button" aria-current={index === playback.index ? "step" : undefined}
                aria-label={"Step " + (index + 1) + ": " + item.label}
                onClick={() => playback.select(index)}>
                <span className="npc-step-number">{index < playback.index ? <Check size={13} /> : "0" + (index + 1)}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="npc-reading-copy"
            onMouseUp={() => { if (window.getSelection()?.toString()) playback.pause(); }}
            aria-live={playback.paused ? "polite" : "off"} aria-atomic="true">
            <p className="npc-eyebrow text-soul">{declined ? "A CHOICE RESPECTED" : "0" + (playback.index + 1) + " / " + step.label.toUpperCase()}</p>
            <h3 className="npc-story-title">{declined ? "No pressure. No introduction." : step.title}</h3>
            <p className="npc-story-detail">{declined ? "In this version, one human passes. Contact stays closed and no shared memory is created." : step.detail}</p>
          </div>
          <p className="mt-6 hidden text-[12px] leading-relaxed text-paper/65 sm:block">
            {playback.index > 0 ? "So far: " + scenario.steps.slice(0, playback.index).map((item) => item.label).join(" → ") : "Your NPC finds an opening. You decide where it goes."}
          </p>
        </div>

        <div className="npc-scene">
          <div className="npc-actor-pair">
            {scenario.actors.map((actor) => <Actor key={actor.handle} actor={actor} />)}
            <div className="npc-connection" data-connected={playback.index > 0 && !declined} aria-hidden>
              <span /><span className="npc-connection-mark">{playback.index === 0 ? <Sparkles size={16} /> : declined ? <X size={16} /> : <Check size={16} />}</span><span />
            </div>
          </div>

          <div className="npc-scene-event" key={playback.index + ending}>
            {playback.index === 0 ? (
              <div className="npc-discovery">
                <span className="npc-eyebrow text-paper/60">A REASON TO CONNECT</span>
                <p>{scenario.permissions[1].value}</p>
                <span className="flex items-center gap-2 text-[12px] text-paper/70"><ShieldCheck size={14} />Only an approved detail is visible.</span>
              </div>
            ) : playback.index === 1 ? (
              <div className="npc-exchange">
                {scenario.exchange.map((line, index) => (
                  <div key={line} className="npc-speech">
                    <span className="npc-eyebrow">{scenario.actors[index].handle}</span>
                    <p>“{line}”</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="npc-invitation flow-surface" data-declined={declined}>
                <FlowSurface />
                <p className="npc-eyebrow flex items-center gap-2">
                  {playback.index === 2 ? <LockKeyhole size={14} /> : declined ? <X size={14} /> : <Check size={14} />}
                  {playback.index === 2 ? "PRIVATE INVITATION" : declined ? "INVITATION CLOSED" : "BOTH ACCEPTED · EXAMPLE"}
                </p>
                <h4>{declined ? "Maybe another time." : scenario.invitation}</h4>
                <p className="npc-invitation-detail">{declined ? "No contact details exchanged. No explanation needed." : scenario.invitationDetail}</p>
                <div className="npc-human-decisions">
                  {scenario.actors.map((actor, index) => (
                    <span key={actor.handle}>{playback.index === 2 ? <Clock3 size={13} /> : declined && index === 1 ? <X size={13} /> : <Check size={13} />}
                      {actor.handle}&apos;s human · {playback.index === 2 ? "pending" : declined && index === 1 ? "passed" : "accepted"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {playback.finished ? (
            <div className="npc-ending-options">
              <span className="text-[12px] text-paper/65">Try another ending</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-pressed={ending === "accepted"} onClick={() => setEnding("accepted")}>Both accept</button>
                <button type="button" aria-pressed={ending === "declined"} onClick={() => setEnding("declined")}>Someone passes</button>
              </div>
            </div>
          ) : <p className="mt-5 text-[12px] text-paper/65">Contact opens only when both humans agree.</p>}
        </div>
      </div>
      <a href="#permissions" className="npc-story-footer">
        <span>What makes this possible?</span><span className="flex items-center gap-2">Your permissions <ArrowDown size={15} /></span>
      </a>
    </div>
  );
}

function Actor({ actor }: { actor: WorldNpc }) {
  const robot = actor.form === "robot";
  return (
    <div className="npc-actor">
      <div className={"npc-avatar " + (robot ? "npc-avatar-robot" : "npc-avatar-digital")} aria-hidden>
        <svg viewBox="0 0 72 72" fill="none">
          {robot ? <>
            <path d="M36 10V17M18 30H13V43H18M54 30H59V43H54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="36" cy="9" r="3" fill="currentColor" />
            <rect x="18" y="18" width="36" height="36" rx="10" stroke="currentColor" strokeWidth="2" />
            <rect x="25" y="29" width="6" height="9" rx="3" fill="currentColor" /><rect x="41" y="29" width="6" height="9" rx="3" fill="currentColor" />
            <path d="M30 44Q36 48 42 44M27 55V60M45 55V60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </> : <>
            <circle cx="36" cy="35" r="23" stroke="currentColor" strokeWidth="1.5" />
            <path d="M24 34Q28 28 32 34M40 34Q44 28 48 34M30 44Q36 49 42 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 18L15 13M53 18L58 14M12 47L7 49M59 47L65 49" stroke="currentColor" strokeWidth="1.5" />
          </>}
        </svg>
      </div>
      <span className="text-[17px] font-semibold sm:text-[20px]">{actor.handle}</span>
      <span className="text-[11px] capitalize text-paper/65">{actor.form}</span>
    </div>
  );
}

function PrivacyExchange({ scenario }: { scenario: WorldScenario }) {
  const [shared, setShared] = useState<PermissionId[]>([]);
  const capabilities = permissionCapabilities(shared);
  const toggle = (id: PermissionId) => setShared((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <section id="permissions" className="npc-section scroll-mt-[72px]">
      <div className="npc-container">
        <SectionHeading {...NPC_WORLD_PAGE.privacy} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[15px] text-steel">{NPC_WORLD_PAGE.privacy.body}</p>
          <span className="npc-eyebrow text-steel">{scenario.city} · {scenario.label} example</span>
        </div>
        <div className="npc-permissions mt-9">
          <div className="npc-permission-header">
            <span>You choose what to share</span>
            <span className="hidden md:block">What this enables</span>
          </div>
          {scenario.permissions.map((option) => {
            const enabled = shared.includes(option.id);
            const Icon = option.id === "location" ? MapPin : option.id === "interest" ? Sparkles : Fingerprint;
            return (
              <div key={option.id} className="npc-permission-row" data-enabled={enabled}>
                <div className="npc-permission-choice">
                  <label className="npc-permission-label">
                    <input type="checkbox" checked={enabled} onChange={() => toggle(option.id)} aria-describedby={option.id + "-preview"} />
                    <span>
                      <span className="block text-[17px] font-semibold">{option.label}</span>
                      <span id={option.id + "-preview"} className="mt-2 block text-[13px] leading-relaxed text-steel">{option.value}</span>
                    </span>
                  </label>
                  <details className="npc-permission-details">
                    <summary>Who can use it &amp; for how long <ChevronDown size={14} /></summary>
                    <dl>
                      <div><dt>Shared with</dt><dd>{option.audience}</dd></div>
                      <div><dt>Retention</dt><dd>{option.retention}. Revoke anytime.</dd></div>
                    </dl>
                  </details>
                </div>
                <div className="npc-permission-result" aria-live="polite" aria-atomic="true">
                  <span className="npc-permission-icon" aria-hidden>{enabled ? <Check size={19} /> : <Icon size={19} />}</span>
                  <div>
                    <p className="npc-eyebrow">{enabled ? "ENABLED IN THIS EXAMPLE" : "IF YOU ALLOW IT"}</p>
                    <h3>{option.benefit}</h3>
                    <p>{option.boundary}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="npc-permission-summary" aria-live="polite" aria-atomic="true">
            <ShieldCheck size={18} className="shrink-0 text-soul" />
            <p>{shared.length === 0
              ? "All off. Browse the world without being discoverable."
              : !capabilities.nearby && !capabilities.matching
                ? "Memory only. Existing connections can continue; new introductions stay off."
                : "Only the enabled details can be used. Contact still needs both humans’ approval."}</p>
            {shared.length > 0 && <button type="button" onClick={() => setShared([])}>Revoke all</button>}
          </div>
        </div>
        <p className="mt-5 flex items-start gap-2 text-[12px] leading-relaxed text-steel">
          <LockKeyhole size={14} className="mt-0.5 shrink-0" />Exact addresses, private chats and account details are never included in these examples.
        </p>
      </div>
    </section>
  );
}

function ContinuityPayoff({ scenario }: { scenario: WorldScenario }) {
  const [showLater, setShowLater] = useState(false);
  return (
    <section className="npc-section border-y border-hairline">
      <div className="npc-container">
        <SectionHeading {...NPC_WORLD_PAGE.continuity} />
        <div className="npc-continuity mt-10">
          <div className="npc-memory-context">
            <div className="npc-moment-tabs" aria-label="View a moment">
              <button type="button" aria-pressed={!showLater} onClick={() => setShowLater(false)}>This time</button>
              <button type="button" aria-pressed={showLater} onClick={() => setShowLater(true)}>Next time</button>
            </div>
            <p className="npc-eyebrow mt-8 text-steel">{showLater ? scenario.nextTimeContext : "AFTER BOTH HUMANS OPT IN"}</p>
            <h3 className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.035em] sm:text-[36px]">
              {showLater ? scenario.nextTime : "One moment worth keeping."}
            </h3>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-steel">
              {showLater ? "A different screen. The same identity and an approved connection to return to." : "Keep a shared memory with this NPC, only if both humans want to. Leave the rest private."}
            </p>
          </div>
          <div className="npc-memory-visual" data-later={showLater}>
            <div className="npc-memory-identity">
              <span className="npc-device" aria-label="Robot body"><Bot size={30} /></span>
              <div><p className="text-[20px] font-semibold">{scenario.actors[0].handle}</p><p className="mt-1 text-[12px] text-steel">Same NPC identity</p></div>
              <ArrowRight size={20} className="ml-auto text-soul" aria-hidden />
              <span className="npc-device" aria-label={scenario.id === "business" ? "On your laptop" : "On your phone"}>
                {scenario.id === "business" ? <MonitorUp size={30} /> : <Smartphone size={30} />}
              </span>
            </div>
            <div className="npc-memory-note">
              <p className="npc-eyebrow flex items-center gap-2 text-steel"><Fingerprint size={14} />ONE APPROVED MEMORY</p>
              <p className="mt-5 text-[20px] font-semibold leading-snug sm:text-[24px]">“{scenario.memory}”</p>
              <p className="mt-6 text-[12px] leading-relaxed text-steel">Only {scenario.actors[0].handle} + {scenario.actors[1].handle} · until revoked</p>
            </div>
            <p className="mt-5 text-[12px] leading-relaxed text-steel">Illustrated continuation, with memory sharing enabled.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorldChoice() {
  return (
    <section className="npc-section">
      <div className="npc-container">
        <SectionHeading {...NPC_WORLD_PAGE.choice} />
        <div className="npc-world-choice mt-10">
          <div>
            <LockKeyhole size={24} className="text-steel" />
            <p className="npc-eyebrow npc-control-label mt-6">WITHOUT NPC WORLD</p>
            <h3>Enjoy complete privacy.</h3>
            <p>Keep your NPC out of the social world. No presence, introductions or shared memories.</p>
          </div>
          <div>
            <Sparkles size={24} className="text-soul" />
            <p className="npc-eyebrow npc-control-label mt-6">WITH NPC WORLD</p>
            <h3>Explore more possibilities.</h3>
            <p>Meet through your NPC, on your terms. Browse privately or open just one door.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title, inverse = false }: { kicker: string; title: string; inverse?: boolean }) {
  return (
    <div>
      <p className="npc-eyebrow npc-section-kicker flex items-center gap-3" data-inverse={inverse}>
        <span className="h-px w-7 shrink-0 bg-vessel" aria-hidden />{kicker}
      </p>
      <h2 className="npc-section-title mt-5">{title}</h2>
    </div>
  );
}
