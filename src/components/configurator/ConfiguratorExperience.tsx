"use client";

import { useEffect } from "react";
import { Check, ShieldCheck } from "lucide-react";
import SoulSetupSteps, {
  CompanionProfile,
} from "./SoulSetupSteps";
import { getConfiguratorSteps, STEP, type StepIndex } from "@/data/configuratorSteps";
import { VESSEL_OPTIONS } from "@/domain/companion/copy";
import {
  BUDGETS,
  CHARACTER_SOURCES,
  type CompanionConfig,
  isOneOf,
  PRIORITIES,
  type ReviewOptions,
  SERVICES,
  VESSEL_FORMS,
} from "@/domain/companion/model";
import { getCompanionProfile } from "@/domain/companion/profile";
import { createReviewCase } from "@/domain/companion/review";
import { updateDemoDraft, useDemoDraft } from "./draftStore";
import { DemoPrivacy } from "./DemoPrivacy";
import {
  DownloadButton,
  FlowFooter,
  FlowHeading,
  FlowShell,
  FlowSteps,
  NextButton,
  OptionGroup,
  focusFlowHeading,
  optionsOf,
} from "./FlowUI";
import { SoulSeal } from "./SoulSeal";

const PRIORITY_COPY = {
  privacy: { label: "Discreet and private", description: "Memory permissions and data handling come first." },
  presence: { label: "A convincing presence", description: "Appearance, expression and interaction matter most." },
  everyday: { label: "Part of everyday life", description: "Continuity, companionship and useful routines." },
} as const satisfies Record<ReviewOptions["priority"], { label: string; description: string }>;
const CHARACTER_SOURCE_COPY = {
  original: "This original demo character",
  "my-character": "An original character I own",
  licensed: { label: "A licensed fictional character", description: "Rights and permitted uses must be verified first." },
} as const satisfies Record<ReviewOptions["characterSource"], string | { label: string; description: string }>;
const BUDGET_LABELS = {
  discuss: "Discuss later",
  "under-10k": "Under $10K",
  "10-25k": "$10K–25K",
  "25-50k": "$25K–50K",
  "50k-plus": "$50K+",
} as const satisfies Record<ReviewOptions["budget"], string>;
const SERVICE_LABELS = {
  discuss: "Discuss later",
  software: "Software and personality updates",
  ongoing: "Ongoing care and support",
} as const satisfies Record<ReviewOptions["service"], string>;

/** Campaign links can open a step by name; locked steps are still clamped to progress. */
const VIEW_STEP: ReadonlyMap<string, StepIndex> = new Map([
  ["choose", STEP.soul],
  ["presence", STEP.presence],
  ["profile", STEP.plan],
  ["plan", STEP.plan],
]);

export default function ConfiguratorExperience() {
  const { draft } = useDemoDraft();
  const { config, review: preferences, step, unlockedStep } = draft;
  const profile = getCompanionProfile(config);
  const steps = getConfiguratorSteps(profile.soul.name);
  const currentStep = steps[step];
  const reviewCase = createReviewCase(config, preferences);
  useEffect(() => {
    const url = new URL(window.location.href);
    const requestedForm = url.searchParams.get("form");
    const initialForm = isOneOf(VESSEL_FORMS, requestedForm) ? requestedForm : undefined;
    const view = url.searchParams.get("view");
    const initialStep = view ? VIEW_STEP.get(view) : undefined;
    if (initialForm === undefined && initialStep === undefined) return;
    updateDemoDraft((current) => ({
      ...current,
      step: initialStep !== undefined
        ? Math.min(initialStep, current.unlockedStep)
        : current.step,
      unlockedStep: initialStep === STEP.soul ? STEP.soul : current.unlockedStep,
      config: initialForm !== undefined
        ? { ...current.config, form: initialForm }
        : current.config,
    }));
    // A campaign link is a starting point, not a persistent override on refresh.
    url.searchParams.delete("form");
    url.searchParams.delete("view");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  function patchReview(patch: Partial<ReviewOptions>) {
    updateDemoDraft((current) => ({
      ...current,
      review: { ...current.review, ...patch },
    }));
  }
  function goToStep(next: number) {
    updateDemoDraft((current) =>
      next < 0 || next > current.unlockedStep
        ? current
        : { ...current, step: next },
    );
    focusFlowHeading();
  }
  function completeStep() {
    updateDemoDraft((current) => {
      if (current.step !== step || current.step >= steps.length - 1)
        return current;
      const next = current.step + 1;
      return {
        ...current,
        step: next,
        unlockedStep: Math.max(current.unlockedStep, next),
      };
    });
    focusFlowHeading();
  }
  return (
    <FlowShell label="REALNPC / CONFIGURATOR">
      <FlowSteps
        labels={steps.map(({ label }) => label)}
        current={step}
        unlockedStep={unlockedStep}
        onChange={goToStep}
      />
      {(step === STEP.presence || step === STEP.priorities) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <SoulSeal soulId={config.soulId} />
            <div>
              <p className="text-sm font-semibold">
                {profile.soul.name} · {profile.soul.archetype}
              </p>
              <p className="mt-1 text-xs text-steel">
                {profile.relationship} ·{" "}
                {profile.memory.mode === "session-only"
                  ? "No lasting memory"
                  : "Selected memory only"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep(STEP.soul)}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-soul-ink underline underline-offset-4"
          >
            Change Soul
          </button>
        </div>
      )}

      <FlowHeading
        eyebrow={`${String(step + 1).padStart(2, "0")} / ${currentStep.eyebrow}`}
        title={currentStep.title}
        description={currentStep.description}
      />
      {step <= STEP.terms && <SoulSetupSteps step={step} onStepChange={goToStep} />}
      {step === STEP.presence && <PresenceStep config={config} reviewCase={reviewCase} />}
      {step === STEP.priorities && (
        <PrioritiesStep preferences={preferences} reviewCase={reviewCase} onChange={patchReview} />
      )}
      {step === STEP.plan && (
        <PlanStep config={config} preferences={preferences} reviewCase={reviewCase} onChangeSoul={() => goToStep(STEP.soul)} />
      )}
      <DemoPrivacy />
      <FlowFooter
        onBack={step > STEP.soul ? () => goToStep(step - 1) : undefined}
        note={`${profile.soul.name} · ${step + 1} of ${steps.length}`}
      >
        {currentStep.nextLabel !== null ? (
          <NextButton onClick={completeStep}>
            {currentStep.nextLabel}
          </NextButton>
        ) : (
          <DownloadButton
            primary
            filename={`realnpc-${profile.soul.name.toLowerCase()}-plan.json`}
            data={reviewCase}
            label="Save your plan"
          />
        )}
      </FlowFooter>
    </FlowShell>
  );
}

type ReviewCase = ReturnType<typeof createReviewCase>;

function PresenceStep({ config, reviewCase }: { config: CompanionConfig; reviewCase: ReviewCase }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <OptionGroup
          label="Where would you meet?"
          value={config.form}
          onChange={(form) =>
            updateDemoDraft((current) => ({
              ...current,
              config: { ...current.config, form },
            }))
          }
          options={optionsOf(VESSEL_FORMS, VESSEL_OPTIONS)}
        />
        <p
          role="status"
          className="mt-3 text-sm leading-relaxed text-soul-ink"
        >
          {VESSEL_OPTIONS[config.form].status}
        </p>
      </div>
      <BuildPath reviewCase={reviewCase} />
    </div>
  );
}

function PrioritiesStep({
  preferences,
  reviewCase,
  onChange: patchReview,
}: {
  preferences: ReviewOptions;
  reviewCase: ReviewCase;
  onChange: (patch: Partial<ReviewOptions>) => void;
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
      <div className="space-y-7">
        <OptionGroup
          label="Lead with this priority"
          value={preferences.priority}
          onChange={(priority) => patchReview({ priority })}
          options={optionsOf(PRIORITIES, PRIORITY_COPY)}
        />
        <OptionGroup
          label="Character source"
          value={preferences.characterSource}
          onChange={(characterSource) => patchReview({ characterSource })}
          options={optionsOf(CHARACTER_SOURCES, CHARACTER_SOURCE_COPY)}
        />
        <p className="text-xs leading-relaxed text-steel">
          This demo covers adult fictional characters only. Minors,
          minor-coded characters, unsafe uses and unauthorized real-person
          likenesses are not supported.
        </p>
        <details className="border-y border-divider py-2">
          <summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold">
            Budget and ongoing care{" "}
            <span className="font-normal text-steel">(optional)</span>
          </summary>
          <div className="space-y-6 pb-4 pt-3">
            <OptionGroup
              label="A planning range, never a quote"
              value={preferences.budget}
              onChange={(budget) => patchReview({ budget })}
              options={optionsOf(BUDGETS, BUDGET_LABELS)}
            />
            <OptionGroup
              label="What kind of support?"
              value={preferences.service}
              onChange={(service) => patchReview({ service })}
              options={optionsOf(SERVICES, SERVICE_LABELS)}
            />
          </div>
        </details>
      </div>
      <aside
        className="border-y border-divider py-5 lg:sticky lg:top-24"
        aria-label="Review focus"
      >
        <h2 className="mb-3 text-sm font-semibold">Your review focus</h2>
        <p role="status" className="text-sm leading-relaxed">
          {reviewCase.path.why}
        </p>
        <p className="mt-4 text-xs leading-relaxed text-steel">
          No price, reservation or submission at this stage.
        </p>
      </aside>
    </div>
  );
}

function PlanStep({
  config,
  preferences,
  reviewCase,
  onChangeSoul,
}: {
  config: CompanionConfig;
  preferences: ReviewOptions;
  reviewCase: ReviewCase;
  onChangeSoul: () => void;
}) {
  return (
    <>
      <CompanionProfile config={config} onChangeSoul={onChangeSoul} />
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          <BuildPath reviewCase={reviewCase} />
          <section className="mt-6 border-t border-hairline pt-5">
            <h2 className="mb-3 text-sm font-semibold">
              Still needs review
            </h2>
            <ul className="space-y-3">
              {reviewCase.reviewNotes.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 text-sm leading-relaxed text-steel"
                >
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-soul-ink"
                  />
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside>
          <h2 className="mb-3 text-sm font-semibold">Your choices</h2>
          <dl className="divide-y divide-hairline text-sm">
            <SummaryRow
              label="Presence"
              value={VESSEL_OPTIONS[config.form].summary}
            />
            <SummaryRow
              label="Planning budget"
              value={BUDGET_LABELS[preferences.budget]}
            />
            <SummaryRow
              label="Ongoing care"
              value={SERVICE_LABELS[preferences.service]}
            />
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-steel">
            No model or hardware is connected. These are proposed
            capabilities, not a delivery promise.
          </p>
        </aside>
      </div>
    </>
  );
}

function BuildPath({ reviewCase }: { reviewCase: ReviewCase }) {
  return (
    <section
      aria-label="Proposed build path"
      className="border-y border-divider py-5 sm:py-6"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-vessel">
        Proposed build path
      </p>
      <h2 className="text-2xl font-semibold leading-tight tracking-tight">
        {reviewCase.path.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-steel">
        {reviewCase.path.description}
      </p>
      <p className="mt-4 text-sm leading-relaxed">{reviewCase.path.why}</p>
      <ul className="mt-5 space-y-3 border-t border-hairline pt-4">
        {reviewCase.path.system.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-relaxed"
          >
            <Check size={15} className="mt-1 shrink-0 text-soul-ink" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <dt className="text-xs text-steel">{label}</dt>
      <dd className="mt-1 leading-relaxed">{value}</dd>
    </div>
  );
}
