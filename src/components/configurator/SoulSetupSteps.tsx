"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import {
  SOULS,
  SCENARIOS,
  getCompanionProfile,
  getScenePreview,
  createProfileText,
  type CompanionConfig,
} from "@/lib/companion";
import {
  useDemoDraft,
  updateDemoDraft,
} from "@/components/companion/useDemoDraft";
import {
  DownloadButton,
  NextEncounter,
  OptionGroup,
  ScriptedReply,
  SoulSeal,
  Toggle,
} from "@/components/companion/FlowUI";

export default function SoulSetupSteps({
  step,
  onStepChange,
}: {
  step: number;
  onStepChange: (step: number) => void;
}) {
  const { draft } = useDemoDraft();
  const { config } = draft;
  const profile = getCompanionProfile(config);

  function patchPreferences(patch: Partial<Omit<CompanionConfig, "soulId">>) {
    updateDemoDraft((current) => ({
      ...current,
      config: { ...current.config, ...patch },
    }));
  }
  const changeSoul = (
    <button
      type="button"
      onClick={() => onStepChange(0)}
      className="inline-flex min-h-11 items-center text-sm font-semibold text-soul-ink underline underline-offset-4"
    >
      Change Soul
    </button>
  );

  return (
    <>
      {step === 0 && (
        <>
          <SoulChoice
            config={config}
            onChoose={(soulId) =>
              updateDemoDraft((current) => ({
                ...current,
                config: { ...current.config, soulId },
              }))
            }
          />
        </>
      )}
      {step === 1 && (
        <>
          <SelectedSoulScenes config={config} />
          <div className="mt-4">{changeSoul}</div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <section aria-label="Relationship preferences">
              <OptionGroup
                label="Conversation style"
                value={config.rhythm}
                onChange={(rhythm) => patchPreferences({ rhythm })}
                compact
                options={[
                  { value: "unhurried", label: "Unhurried" },
                  { value: "playful", label: "Playful" },
                  { value: "direct", label: "Direct" },
                ]}
              />
              <p
                role="status"
                className="mt-3 text-sm leading-relaxed text-soul-ink"
              >
                {profile.relationship}.
              </p>
              <div className="mt-4">
                <Toggle
                  label="Let them take the lead"
                  description={
                    config.takesInitiative
                      ? `${profile.soul.name} can suggest a plan. You can decline.`
                      : `${profile.soul.name} waits for your invitation.`
                  }
                  checked={config.takesInitiative}
                  onChange={(takesInitiative) =>
                    patchPreferences({ takesInitiative })
                  }
                />
              </div>
              <h2 className="mb-1 mt-7 text-sm font-semibold">
                Memory &amp; privacy
              </h2>
              <Toggle
                label="Remember my preferences"
                description={
                  config.rememberPreferences
                    ? "Recall your pace and invitation style."
                    : "No preferences carried forward."
                }
                checked={config.rememberPreferences}
                onChange={(rememberPreferences) =>
                  patchPreferences({ rememberPreferences })
                }
              />
              <Toggle
                label="Keep a shared moment"
                description={
                  config.rememberMoments
                    ? "Recall the sample moment when you changed your mind."
                    : "No shared moments carried forward."
                }
                checked={config.rememberMoments}
                onChange={(rememberMoments) =>
                  patchPreferences({ rememberMoments })
                }
              />
              <Toggle
                label="Public World introduction"
                description={
                  config.worldVisible
                    ? "An introduction only. Private memories stay private."
                    : "No public introduction."
                }
                checked={config.worldVisible}
                onChange={(worldVisible) => patchPreferences({ worldVisible })}
              />
              <p className="mt-4 text-xs leading-relaxed text-steel">
                Preview settings only. Nothing is stored in a companion memory
                or published.
              </p>
            </section>
            <aside
              className="lg:sticky lg:top-24"
              aria-label="Effect of your choices"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-soul-ink">
                With these settings
              </p>
              <NextEncounter config={config} />
            </aside>
          </div>
        </>
      )}
    </>
  );
}

export function CompanionProfile({
  config,
  onChangeSoul,
}: {
  config: CompanionConfig;
  onChangeSoul: () => void;
}) {
  const profile = getCompanionProfile(config);
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <section
        aria-label="Companion profile"
        className="rounded-md border border-soul-ink/30 bg-soul-tint/60 p-5 sm:p-7"
      >
        <div className="flex items-center gap-4">
          <SoulSeal soulId={config.soulId} large />
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              {profile.soul.name}
            </h2>
            <p className="mt-1 text-sm text-steel">{profile.soul.archetype}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed">{profile.soul.signature}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-soul-ink/20 pt-5">
          <ProfileFact
            label="Conversation style"
            value={
              {
                unhurried: "Unhurried",
                playful: "Playful",
                direct: "Direct",
              }[config.rhythm]
            }
          />
          <ProfileFact
            label="Initiative"
            value={
              config.takesInitiative
                ? profile.soul.behavior.initiative
                : "Waits for your invitation"
            }
          />
          <ProfileFact label="Warmth" value={profile.soul.behavior.warmth} />
          <ProfileFact label="Humor" value={profile.soul.behavior.humor} />
        </dl>
        <div className="mt-7 flex flex-wrap items-start gap-x-5 gap-y-2">
          <DownloadButton
            filename={`realnpc-${profile.soul.name.toLowerCase()}-profile.txt`}
            label="Save profile"
            format="text"
            data={createProfileText(config)}
          />
          <button
            type="button"
            onClick={onChangeSoul}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-soul-ink underline underline-offset-4"
          >
            Change Soul
          </button>
        </div>
      </section>
      <aside className="space-y-6">
        <section aria-labelledby="memory-heading">
          <h2 id="memory-heading" className="mb-3 text-sm font-semibold">
            What carries forward
          </h2>
          {profile.memory.items.length > 0 ? (
            <ul className="space-y-3">
              {profile.memory.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed">
                  <Check className="mt-1 shrink-0 text-soul-ink" size={14} />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No preferences or moments retained.</p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-steel">
            Sample memories, not saved conversations.
          </p>
        </section>
        <section
          aria-labelledby="powers-heading"
          className="border-t border-hairline pt-5"
        >
          <h2 id="powers-heading" className="mb-2 text-sm font-semibold">
            Proposed Powers
          </h2>
          <p className="text-sm leading-relaxed text-powers-ink">
            {profile.powers.join(" · ")}
          </p>
          <p className="mt-2 text-xs text-steel">No services connected.</p>
        </section>
        <section className="border-t border-hairline pt-5">
          <h2 className="mb-2 text-sm font-semibold">World visibility</h2>
          <p className="text-sm leading-relaxed text-steel">
            {profile.visibility}
          </p>
          <Link
            href="/npc-world"
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-soul-ink"
          >
            Explore NPC World <ArrowRight size={15} />
          </Link>
        </section>
      </aside>
    </div>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-steel">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

function SoulChoice({
  config,
  onChoose,
}: {
  config: CompanionConfig;
  onChoose: (soulId: CompanionConfig["soulId"]) => void;
}) {
  return (
    <section aria-label="Compare Soul responses">
      <div className="mb-4 border-y border-hairline bg-paper/45 px-4 py-4 sm:mb-5 sm:px-5">
        <p className="mb-2 text-xs font-semibold text-steel">YOU</p>
        <p className="max-w-[70ch] text-sm leading-relaxed">
          “{SCENARIOS.chemistry.prompt}”
        </p>
      </div>
      <fieldset>
        <legend className="sr-only">Choose a Soul</legend>
        <div className="grid gap-3 lg:grid-cols-3">
          {SOULS.map((soul) => {
            const selected = soul.id === config.soulId;
            return (
              <label
                key={soul.id}
                className="relative flex min-w-0 cursor-pointer"
              >
                <input
                  type="radio"
                  name="soul"
                  value={soul.id}
                  aria-label={soul.name}
                  checked={selected}
                  onChange={() => onChoose(soul.id)}
                  className="peer sr-only"
                />
                <span className="flex w-full flex-col rounded-md border border-divider bg-paper p-4 transition-colors motion-reduce:transition-none hover:border-soul-ink/60 peer-checked:border-soul-ink peer-checked:hover:border-soul-ink peer-checked:bg-soul-tint/65 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-soul-ink sm:p-6">
                  <span className="mb-4 flex items-center gap-3">
                    <SoulSeal soulId={soul.id} />
                    <span className="min-w-0 flex-1">
                      <span
                        role="heading"
                        aria-level={2}
                        className="block text-xl font-semibold"
                      >
                        {soul.name}
                      </span>
                      <span className="mt-1 block text-xs text-steel">
                        {soul.archetype}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-soul-ink bg-soul-ink text-white" : "border-steel"}`}
                    >
                      {selected && <Check size={12} />}
                    </span>
                  </span>
                  <span className="block text-[15px] leading-[1.75] text-ink">
                    {
                      getScenePreview(
                        { ...config, soulId: soul.id },
                        "chemistry",
                      ).reply
                    }
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="mt-4 text-xs leading-relaxed text-steel">
        Original adult fictional characters. Scripted replies.
      </p>
    </section>
  );
}

function SelectedSoulScenes({ config }: { config: CompanionConfig }) {
  const [sceneId, setSceneId] = useState<"everyday" | "boundary" | "plan">(
    "everyday",
  );
  const profile = getCompanionProfile(config);
  const scene =
    sceneId === "plan"
      ? profile.planEncounter
      : getScenePreview(config, sceneId);
  return (
    <section
      aria-label={`${profile.soul.name} in everyday life`}
      className="max-w-[800px]"
    >
      <OptionGroup
        label="Scene"
        compact
        value={sceneId}
        onChange={setSceneId}
        options={[
          { value: "everyday", label: "A rough day" },
          { value: "boundary", label: "A change of mind" },
          { value: "plan", label: "An hour together" },
        ]}
      />
      <div className="mb-6 mt-5 border-y border-hairline bg-paper/45 px-4 py-4 sm:px-5">
        <p className="mb-2 text-xs font-semibold text-steel">YOU</p>
        <p className="text-sm leading-relaxed">“{scene.prompt}”</p>
      </div>
      <div className="flex items-start gap-4">
        <SoulSeal soulId={config.soulId} />
        <div>
          <h2 className="mb-2 text-lg font-semibold">{profile.soul.name}</h2>
          <ScriptedReply key={sceneId} text={scene.reply} />
        </div>
      </div>
    </section>
  );
}
