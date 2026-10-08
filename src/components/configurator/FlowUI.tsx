"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Download } from "lucide-react";

// Configurator UI primitives: no draft store and no companion domain imports.

export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-vessel px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-vessel-hover active:translate-y-px sm:px-5";
export const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-divider bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-panel";

export function focusFlowHeading() {
  requestAnimationFrame(() => {
    document.getElementById("flow-heading")?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  });
}

export function FlowShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <main className="companion-flow min-h-screen pb-36 pt-[72px] text-ink">
      <div className="border-b border-hairline">
        <div className="mx-auto flex max-w-[1184px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-xs sm:px-8">
          <span className="font-semibold tracking-wide">
            <span className="sm:hidden">{label.replace("REALNPC / ", "")}</span>
            <span className="hidden sm:inline">{label}</span>
          </span>
          <span className="flex items-center gap-2 text-steel">
            <span className="h-1.5 w-1.5 rounded-full bg-soul" aria-hidden />
            <span>
              Scripted demo
              <span className="hidden sm:inline"> · no AI connected</span>
            </span>
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-[1184px] px-5 pt-4 sm:px-8 sm:pt-7">
        {children}
      </div>
    </main>
  );
}

export function FlowSteps({
  labels,
  current,
  unlockedStep,
  onChange,
}: {
  labels: readonly string[];
  current: number;
  unlockedStep: number;
  onChange: (step: number) => void;
}) {
  return (
    <nav aria-label="Experience steps" className="mb-4 sm:mb-8">
      <ol className="grid grid-cols-3 gap-x-3 gap-y-1 sm:grid-cols-6">
        {labels.map((label, index) => (
          <li key={label} className="min-w-0 flex-1">
            <button
              type="button"
              disabled={index > unlockedStep}
              title={
                index > unlockedStep
                  ? "Complete the previous steps to unlock"
                  : undefined
              }
              onClick={() => onChange(index)}
              aria-current={index === current ? "step" : undefined}
              className={`flex min-h-12 w-full flex-col items-start justify-center gap-2 border-b-2 pb-2 text-left text-xs disabled:cursor-not-allowed disabled:opacity-40 sm:flex-row sm:items-center sm:justify-start sm:gap-2 sm:text-sm ${index === current ? "border-vessel font-semibold text-ink" : "border-hairline text-steel enabled:hover:border-steel enabled:hover:text-ink"}`}
            >
              <span className="hidden sm:inline" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FlowHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-5 max-w-[760px] sm:mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-soul-ink">
        {eyebrow}
      </p>
      <h1
        id="flow-heading"
        tabIndex={-1}
        className="text-[22px] font-semibold leading-[1.15] tracking-[-0.035em] outline-none min-[360px]:text-[28px] sm:text-[38px]"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-steel sm:text-base">
        {description}
      </p>
    </header>
  );
}

export function FlowFooter({
  onBack,
  children,
  note,
}: {
  onBack?: () => void;
  children: ReactNode;
  note: string;
}) {
  return (
    <footer
      data-flow-footer
      className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-paper px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_24px_rgba(21,24,29,0.035)]"
    >
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Previous step"
              className="flex min-h-12 min-w-12 items-center justify-center rounded-md border border-divider hover:bg-panel"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <p className="hidden text-xs leading-relaxed text-steel sm:block">
            {note}
          </p>
        </div>
        {children}
      </div>
    </footer>
  );
}

export function NextButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={primaryButton}>
      {children}
      <ArrowRight size={17} />
    </button>
  );
}

/** Builds OptionGroup options from an ordered value list and a copy table keyed by value. */
export function optionsOf<T extends string>(
  values: readonly T[],
  copy: Readonly<Record<T, string | { label: string; description?: string }>>,
) {
  return values.map((value) => {
    const entry = copy[value];
    return typeof entry === "string"
      ? { value, label: entry }
      : { value, label: entry.label, description: entry.description };
  });
}

export function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{label}</legend>
      <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2"}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`relative cursor-pointer ${compact ? "min-w-0 flex-1" : "block"}`}
          >
            <input
              className="peer sr-only"
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-divider px-3 py-3 text-sm transition-colors motion-reduce:transition-none peer-checked:border-soul-ink peer-checked:bg-soul-tint peer-checked:hover:bg-soul-tint peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-soul-ink hover:bg-panel sm:px-4">
              <span>
                <span className="block font-semibold">{option.label}</span>
                {option.description && (
                  <span className="mt-1 block text-xs leading-relaxed text-steel">
                    {option.description}
                  </span>
                )}
              </span>
              {!compact && (
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${value === option.value ? "border-soul-ink bg-soul-ink text-white" : "border-steel"}`}
                >
                  {value === option.value && <Check size={12} />}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={id}
      onClick={() => onChange(!checked)}
      className="flex min-h-16 w-full items-center justify-between gap-5 border-b border-hairline py-4 text-left hover:bg-panel/70"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span
          id={id}
          className="mt-1 block max-w-[54ch] text-xs leading-relaxed text-steel"
        >
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors motion-reduce:transition-none ${checked ? "bg-soul-ink" : "bg-steel"}`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-paper transition-transform motion-reduce:transition-none ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

export function DownloadButton({
  filename,
  data,
  label,
  format = "json",
  primary = false,
}: {
  filename: string;
  data: unknown;
  label: string;
  format?: "json" | "text";
  primary?: boolean;
}) {
  const [status, setStatus] = useState("");
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob(
          [format === "text" ? String(data) : JSON.stringify(data, null, 2)],
          {
            type:
              format === "text"
                ? "text/plain;charset=utf-8"
                : "application/json",
          },
        ),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Download started. Keep this file private.");
    } catch {
      setStatus(
        "Download unavailable in this browser. Your preview is still visible here.",
      );
    }
  }
  return (
    <div>
      <button
        type="button"
        onClick={download}
        className={primary ? primaryButton : secondaryButton}
      >
        <Download size={16} />
        {label}
      </button>
      <p
        role="status"
        className={primary ? "sr-only" : "mt-2 text-xs text-steel"}
      >
        {status}
      </p>
    </div>
  );
}
