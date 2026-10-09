"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SoulSetupSteps from "./SoulSetupSteps";
import { getConfiguratorSteps, STEP, type StepIndex } from "@/data/configuratorSteps";
import { getSoulName, VESSEL_FORMS, isOneOf } from "@/domain/companion/model";
import { updateDemoDraft, useDemoDraft } from "./draftStore";
import { primaryButton, FlowFooter, FlowHeading, FlowShell, FlowSteps, NextButton, focusFlowHeading } from "./FlowUI";
const AssemblyStep = dynamic(() => import("./AssemblyStep"), { loading: () => <p role="status">Preparing assembly options…</p> });
const SoulDetails = dynamic(() => import("./SoulDetails").then(module => module.SoulDetails), { loading: () => <p role="status">Preparing capability settings…</p> });
const SoulReview = dynamic(() => import("./SoulReview"), { loading: () => <p role="status">Preparing your Soul…</p> });
import "./soul-studio.css";

const VIEW_STEP: ReadonlyMap<string, StepIndex> = new Map([["choose", STEP.soul], ["presence", STEP.presence], ["profile", STEP.plan], ["plan", STEP.plan]]);

export default function ConfiguratorExperience() {
  const { draft } = useDemoDraft();
  const { config, step, unlockedStep } = draft;
  const name = getSoulName(config);
  const steps = getConfiguratorSteps(name);
  const current = steps[step];
  useEffect(() => {
    const url = new URL(window.location.href);
    const form = url.searchParams.get("form");
    const view = url.searchParams.get("view");
    const initialStep = view ? VIEW_STEP.get(view) : undefined;
    if (!isOneOf(VESSEL_FORMS, form) && initialStep === undefined) return;
    updateDemoDraft(current => ({ ...current,
      step: initialStep !== undefined ? Math.min(initialStep, current.unlockedStep) : current.step,
      unlockedStep: initialStep === STEP.soul ? STEP.soul : current.unlockedStep,
      config: isOneOf(VESSEL_FORMS, form) ? { ...current.config, form, assembly: form === "robot" ? "preset" : "software" } : current.config,
    }));
    url.searchParams.delete("form"); url.searchParams.delete("view");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  function goToStep(next: number) {
    updateDemoDraft(current => next < 0 || next > current.unlockedStep ? current : { ...current, step: next });
    focusFlowHeading();
  }
  function completeStep() {
    updateDemoDraft(current => current.step !== step || step >= STEP.plan ? current : { ...current, step: step + 1, unlockedStep: Math.max(current.unlockedStep, step + 1) });
    focusFlowHeading();
  }
  return <FlowShell>
    <FlowSteps labels={steps.map(item => item.label)} current={step} unlockedStep={unlockedStep} onChange={goToStep} />
    {step === STEP.details ? <h1 id="flow-heading" tabIndex={-1} className="sr-only">Detailed settings</h1> : <FlowHeading title={current.title} description={current.description} />}
    {step <= STEP.personality && <SoulSetupSteps step={step} />}
    {step === STEP.presence && <AssemblyStep config={config} />}
    {step === STEP.details && <SoulDetails />}
    {step === STEP.plan && <SoulReview config={config} onEdit={goToStep} />}
    <FlowFooter onBack={step > 0 ? () => goToStep(step - 1) : undefined} note={`${name} · ${step + 1} of ${steps.length}`}>
      {step === STEP.details ? <div className="soul-details-actions"><button type="button" className="soul-skip-button" onClick={completeStep} title="Keep your current settings and continue to Review">Skip for now <ArrowRight size={14} aria-hidden="true" /></button><NextButton onClick={completeStep}>{current.nextLabel}</NextButton></div> : current.nextLabel ? <NextButton onClick={completeStep}>{current.nextLabel}</NextButton> : <Link href="/demo/" className={`${primaryButton} soul-start-conversation`}>Start Conversation with {name}<ArrowUpRight size={17} /></Link>}
    </FlowFooter>
  </FlowShell>;
}
