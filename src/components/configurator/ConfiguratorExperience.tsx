"use client";

import { useEffect } from "react";
import { Check, ShieldCheck } from "lucide-react";
import SoulSetupSteps, {
  CompanionProfile,
} from "./SoulSetupSteps";
import { getConfiguratorSteps } from "@/data/configuratorSteps";
import {
  createReviewCase,
  getCompanionProfile,
  VESSEL_LABELS,
  type ReviewOptions,
} from "@/lib/companion";
import {
  useDemoDraft,
  updateDemoDraft,
} from "@/components/companion/useDemoDraft";
import {
  DemoPrivacy,
  DownloadButton,
  FlowFooter,
  FlowHeading,
  FlowShell,
  FlowSteps,
  NextButton,
  OptionGroup,
  SoulSeal,
  focusFlowHeading,
} from "@/components/companion/FlowUI";

const BUDGET_LABELS = {
  discuss: "Discuss later",
  "under-10k": "Under $10K",
  "10-25k": "$10K–25K",
  "25-50k": "$25K–50K",
  "50k-plus": "$50K+",
};
const SERVICE_LABELS = {
  discuss: "Discuss later",
  software: "Software and personality updates",
  ongoing: "Ongoing care and support",
};

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
    const initialForm =
      requestedForm === "robot" ||
      requestedForm === "digital-human" ||
      requestedForm === "undecided"
        ? requestedForm
        : undefined;
    const view = url.searchParams.get("view");
    const initialStep =
      view === "choose"
        ? 0
        : view === "presence"
          ? 3
          : view === "profile" || view === "plan"
            ? 5
            : undefined;
    const applyForm = initialForm && url.searchParams.has("form");
    const applyView = initialStep !== undefined && url.searchParams.has("view");
    if (!applyForm && !applyView) return;
    updateDemoDraft((current) => ({
      ...current,
      step: applyView
        ? Math.min(initialStep, current.unlockedStep)
        : current.step,
      unlockedStep: view === "choose" ? 0 : current.unlockedStep,
      config: applyForm
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
      {step > 2 && step < 5 && (
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
            onClick={() => goToStep(0)}
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
      {step < 3 && <SoulSetupSteps step={step} onStepChange={goToStep} />}
      {step === 3 && (
        <>
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
                options={[
                  {
                    value: "digital-human",
                    label: "A digital companion",
                    description: "On screen, with voice and expression.",
                  },
                  {
                    value: "robot",
                    label: "A physical companion",
                    description:
                      "An embodied Vessel. Hardware and service review required.",
                  },
                  {
                    value: "undecided",
                    label: "Keep the form open",
                    description: "Explore digital and physical options.",
                  },
                ]}
              />
              <p
                role="status"
                className="mt-3 text-sm leading-relaxed text-soul-ink"
              >
                {config.form === "robot"
                  ? "Your path now includes hardware, safety and maintenance review."
                  : config.form === "digital-human"
                    ? "Your path starts on screen. No hardware commitment."
                    : "Your path keeps digital and physical options open."}
              </p>
            </div>
            <BuildPath reviewCase={reviewCase} />
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
            <div className="space-y-7">
              <OptionGroup
                label="Lead with this priority"
                value={preferences.priority}
                onChange={(priority) => patchReview({ priority })}
                options={[
                  {
                    value: "privacy",
                    label: "Discreet and private",
                    description:
                      "Memory permissions and data handling come first.",
                  },
                  {
                    value: "presence",
                    label: "A convincing presence",
                    description:
                      "Appearance, expression and interaction matter most.",
                  },
                  {
                    value: "everyday",
                    label: "Part of everyday life",
                    description:
                      "Continuity, companionship and useful routines.",
                  },
                ]}
              />
              <OptionGroup
                label="Character source"
                value={preferences.characterSource}
                onChange={(characterSource) => patchReview({ characterSource })}
                options={[
                  { value: "original", label: "This original demo character" },
                  {
                    value: "my-character",
                    label: "An original character I own",
                  },
                  {
                    value: "licensed",
                    label: "A licensed fictional character",
                    description:
                      "Rights and permitted uses must be verified first.",
                  },
                ]}
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
                    options={Object.entries(BUDGET_LABELS).map(
                      ([value, label]) => ({
                        value: value as ReviewOptions["budget"],
                        label,
                      }),
                    )}
                  />
                  <OptionGroup
                    label="What kind of support?"
                    value={preferences.service}
                    onChange={(service) => patchReview({ service })}
                    options={Object.entries(SERVICE_LABELS).map(
                      ([value, label]) => ({
                        value: value as ReviewOptions["service"],
                        label,
                      }),
                    )}
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
        </>
      )}

      {step === 5 && (
        <>
          <CompanionProfile config={config} onChangeSoul={() => goToStep(0)} />
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
                  value={VESSEL_LABELS[config.form]}
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
      )}
      <DemoPrivacy />
      <FlowFooter
        onBack={step > 0 ? () => goToStep(step - 1) : undefined}
        note={`${profile.soul.name} · ${step + 1} of ${steps.length}`}
      >
        {currentStep.nextLabel !== null ? (
          <NextButton onClick={completeStep}>
            {currentStep.nextLabel}
          </NextButton>
        ) : (
          <DownloadButton
            key={JSON.stringify(reviewCase)}
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

function BuildPath({
  reviewCase,
}: {
  reviewCase: ReturnType<typeof createReviewCase>;
}) {
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
