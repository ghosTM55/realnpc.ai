import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  Handshake,
  Network,
  Store,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FlowSurface } from "@/components/FlowBackground";
import SectionDivider from "@/components/SectionDivider";
import { PARTNERSHIP } from "@/data/site";

export const metadata: Metadata = {
  title: "RealNPC | Partnership",
  description:
    "Partner with RealNPC across character IP, robotics hardware modules, and real-world activation sites.",
};

const ICONS = {
  soul: BadgeCheck,
  vessel: Cpu,
  powers: Store,
} as const;

const TONE = {
  soul: {
    text: "text-soul",
    border: "border-soul/40",
    bg: "bg-soul",
    tint: "bg-soul-tint",
  },
  vessel: {
    text: "text-vessel",
    border: "border-vessel/40",
    bg: "bg-vessel",
    tint: "bg-vessel-tint",
  },
  powers: {
    text: "text-powers",
    border: "border-powers/45",
    bg: "bg-powers",
    tint: "bg-powers-tint",
  },
} as const;

type Lane = (typeof PARTNERSHIP.lanes)[number];

export default function PartnershipPage() {
  return (
    <main className="bg-paper">
      <Nav />
      <Hero />
      <SectionDivider label="PARTNER PATHS" />
      <PartnerPaths />
      <SectionDivider label="OPERATING MODEL" />
      <OperatingModel />
      <Close />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline pt-[72px]">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,var(--vessel-red),var(--soul-blue),var(--powers-amber),transparent)]"
      />

      <div className="relative mx-auto grid max-w-[1248px] gap-14 px-6 py-20 lg:grid-cols-[minmax(0,0.98fr)_400px] lg:px-0 lg:py-24">
        <div>
          <p className="font-signal text-[12px] font-bold tracking-[0.18em] text-vessel">
            {PARTNERSHIP.hero.kicker}
          </p>
          <h1 className="mt-5 max-w-[780px] font-display text-[54px] font-semibold leading-[0.96] text-ink md:text-[74px]">
            {PARTNERSHIP.hero.title}
          </h1>
          <p className="mt-7 max-w-[700px] text-[18px] leading-[1.55] text-steel md:text-[20px]">
            {PARTNERSHIP.hero.lead}
          </p>
        </div>

        <aside className="relative self-end border border-hairline bg-white/[0.82] p-5 shadow-[0_18px_48px_rgba(21,24,29,0.07)]">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-soul/60"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-vessel/60"
          />
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <p className="font-signal text-[11px] font-bold tracking-[0.16em] text-ink">
              PARTNER SIGNAL
            </p>
            <Network size={16} className="text-soul" />
          </div>
          <ol className="mt-4 space-y-3">
            {PARTNERSHIP.hero.signal.map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-paper font-signal text-[11px] font-semibold text-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[14px] leading-[1.35] text-steel">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}

function PartnerPaths() {
  return (
    <section className="mx-auto max-w-[1248px] px-6 py-14 lg:px-0">
      <div className="space-y-4">
        {PARTNERSHIP.lanes.map((lane) => (
          <PartnerLane key={lane.label} lane={lane} />
        ))}
      </div>
    </section>
  );
}

function PartnerLane({ lane }: { lane: Lane }) {
  const tone = TONE[lane.tone];
  const Icon = ICONS[lane.tone];

  return (
    <article
      className={`group relative overflow-hidden rounded-[8px] border bg-white shadow-[0_16px_44px_rgba(21,24,29,0.055)] transition-[border-color,transform] duration-300 hover:-translate-y-0.5 ${tone.border}`}
    >
      <div
        aria-hidden
        className={`absolute left-0 top-0 h-full w-1 ${tone.bg}`}
      />
      <div className="grid lg:grid-cols-[150px_minmax(0,1fr)_318px]">
        <div className="flex items-start justify-between border-b border-hairline p-6 lg:block lg:border-b-0 lg:border-r">
          <span className={`font-signal text-[32px] font-bold ${tone.text}`}>
            {lane.index}
          </span>
          <Icon className={`${tone.text} lg:mt-24`} size={26} />
        </div>

        <div className="p-6 lg:px-8 lg:py-7">
          <p className={`font-signal text-[12px] font-bold tracking-[0.16em] ${tone.text}`}>
            {lane.label.toUpperCase()}
          </p>
          <h2 className="mt-3 max-w-[690px] font-display text-[28px] font-semibold leading-[1.08] text-ink md:text-[36px]">
            {lane.title}
          </h2>
          <p className="mt-4 max-w-[740px] text-[15px] leading-[1.58] text-steel md:text-[16px]">
            {lane.description}
          </p>
        </div>

        <div className={`${tone.tint} border-t border-hairline p-6 lg:border-l lg:border-t-0`}>
          <dl className="space-y-5">
            <div>
              <dt className="font-signal text-[11px] font-bold tracking-[0.12em] text-ink">
                CONTRIBUTION
              </dt>
              <dd className="mt-2 text-[13px] leading-[1.45] text-steel">
                {lane.contribution}
              </dd>
            </div>
            <div>
              <dt className="font-signal text-[11px] font-bold tracking-[0.12em] text-ink">
                OUTCOME
              </dt>
              <dd className="mt-2 text-[13px] leading-[1.45] text-steel">
                {lane.outcome}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

function OperatingModel() {
  return (
    <section className="mx-auto grid max-w-[1248px] gap-10 px-6 py-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(460px,1fr)] lg:items-start lg:px-0">
      <div>
        <p className="font-signal text-[12px] font-bold tracking-[0.16em] text-vessel">
          {PARTNERSHIP.thesis.kicker}
        </p>
        <h2 className="mt-4 max-w-[660px] font-display text-[34px] font-semibold leading-[1.05] text-ink md:text-[48px]">
          {PARTNERSHIP.thesis.title}
        </h2>
        <p className="mt-6 max-w-[600px] text-[17px] leading-[1.58] text-steel">
          {PARTNERSHIP.thesis.body}
        </p>
      </div>

      <div className="relative border border-hairline bg-white p-6 shadow-[0_18px_48px_rgba(21,24,29,0.06)]">
        <span
          aria-hidden
          className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-vessel/60"
        />
        <span
          aria-hidden
          className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-powers/70"
        />
        <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-x-5 gap-y-7">
          <ModelStep
            tone="soul"
            label="Identity"
            text="IP defines who the companion can become and what it must protect."
          />
          <ModelStep
            tone="vessel"
            label="Build"
            text="Hardware partners define what can be configured, serviced, and scaled."
          />
          <ModelStep
            tone="powers"
            label="Place"
            text="Offline partners define where the robot can create repeatable value."
          />
        </div>
      </div>
    </section>
  );
}

function ModelStep({
  tone,
  label,
  text,
}: {
  tone: keyof typeof TONE;
  label: string;
  text: string;
}) {
  const toneStyle = TONE[tone];

  return (
    <>
      <span
        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${toneStyle.bg} text-white`}
      >
        <Handshake size={17} />
      </span>
      <div className="border-b border-hairline pb-6 last:border-b-0 last:pb-0">
        <h3 className="font-display text-[22px] font-semibold leading-none text-ink">
          {label}
        </h3>
        <p className="mt-2 max-w-[420px] text-[14px] leading-[1.5] text-steel">
          {text}
        </p>
      </div>
    </>
  );
}

function Close() {
  return (
    <section className="mx-auto max-w-[1248px] px-6 pb-24 pt-8 lg:px-0">
      <div className="flow-surface relative overflow-hidden rounded-[8px] border border-hairline bg-ink px-7 py-8 text-white shadow-[0_24px_64px_rgba(21,24,29,0.16)] md:px-10 md:py-10">
        <FlowSurface />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(to_right,var(--vessel-red),var(--soul-blue),var(--powers-amber))]"
        />
        <p className="font-signal text-[11px] font-bold tracking-[0.18em] text-soul">
          {PARTNERSHIP.close.label}
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 className="max-w-[760px] font-display text-[32px] font-semibold leading-[1.08] md:text-[46px]">
              {PARTNERSHIP.close.title}
            </h2>
            <p className="mt-5 max-w-[650px] text-[15px] leading-[1.55] text-white/[0.72] md:text-[16px]">
              {PARTNERSHIP.close.text}
            </p>
          </div>
          <a
            href={PARTNERSHIP.close.href}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-[5px] bg-white px-5 font-signal text-[13px] font-semibold tracking-[0.04em] text-ink transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-[0.99]"
          >
            {PARTNERSHIP.close.cta}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
