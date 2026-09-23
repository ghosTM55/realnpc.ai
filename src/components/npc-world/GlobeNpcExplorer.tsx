"use client";

import { Component, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { ArrowRight, Globe2, RotateCcw, X } from "lucide-react";
import type { GlobeCanvasProps } from "./GlobeCanvas";
import { NPC_WORLD_PAGE, WORLD_SCENARIOS, type ScenarioId, type WorldScenario } from "@/data/npcWorldPage";
import { NPC_WORLD, type WorldCity } from "@/data/npcWorld";
import { useSceneActivity } from "./useWorldPlayback";

export default function GlobeNpcExplorer({ scenario, onScenarioChange }: {
  scenario: WorldScenario;
  onScenarioChange: (id: ScenarioId) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { active, reducedMotion } = useSceneActivity(wrapRef);
  const [GlobeComp, setGlobeComp] = useState<ComponentType<GlobeCanvasProps> | null>(null);
  const [countries, setCountries] = useState<object[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [exploredCity, setExploredCity] = useState<WorldCity | null>(null);
  const [focused, setFocused] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const selectedCity = exploredCity ?? NPC_WORLD.find((city) => city.id === scenario.cityId)!;
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    Promise.all([
      import("./GlobeCanvas"),
      fetch("/data/countries-110m.geojson", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Map unavailable");
          return response.json();
        })
        .then((geo) => {
          if (!Array.isArray(geo.features)) throw new Error("Invalid map");
          return geo.features as object[];
        }),
    ]).then(([module, features]) => {
      if (!mounted) return;
      setCountries(features);
      setGlobeComp(() => module.default);
    }).catch(() => { if (mounted) setLoadError(true); });
    return () => { mounted = false; controller.abort(); };
  }, [attempt]);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const syncSize = () => setDims({ w: node.clientWidth, h: node.clientHeight });
    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const selectCity = useCallback((city: WorldCity) => {
    const story = WORLD_SCENARIOS.find((item) => item.cityId === city.id);
    setFocused(true);
    if (story) { setExploredCity(null); onScenarioChange(story.id); }
    else setExploredCity(city);
  }, [onScenarioChange]);
  const retry = () => {
    setLoadError(false);
    setGlobeComp(null);
    setAttempt((value) => value + 1);
  };

  return (
    <div className="npc-globe-hero">
      <div className="npc-hero-copy">
        <p data-hero-item className="npc-eyebrow npc-section-kicker">{NPC_WORLD_PAGE.hero.kicker}</p>
        <h1 data-hero-item className="mt-5 whitespace-nowrap font-display text-[clamp(26px,7vw,36px)] font-semibold leading-tight tracking-[-0.045em]">{NPC_WORLD_PAGE.hero.title}</h1>
        <p data-hero-item className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-steel">{NPC_WORLD_PAGE.hero.sub}</p>
        <a data-hero-item href="#encounter" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-vessel">
          See what happens <ArrowRight size={15} />
        </a>
      </div>

      <div ref={wrapRef} className="npc-globe-canvas" aria-label="Explore the NPC World demo globe">
        {loadError ? <GlobeFallback onRetry={retry} /> : GlobeComp && dims.w > 0 ? (
          <GlobeBoundary key={attempt} fallback={<GlobeFallback onRetry={retry} />}>
            <GlobeComp countries={countries} width={dims.w} height={dims.h}
              active={active} reducedMotion={reducedMotion} focused={focused}
              selectedCity={selectedCity} onSelectCity={selectCity}
            />
          </GlobeBoundary>
        ) : <GlobeFallback loading />}
      </div>

      <aside data-hero-item className="npc-globe-panel">
        <div className="flex items-center justify-between gap-3">
          <p className="npc-eyebrow text-steel">{exploredCity ? exploredCity.city : scenario.city}</p>
          <span className="npc-demo-label">WORLD DEMO</span>
        </div>
        {exploredCity ? (
          <>
            <div className="mt-5 flex items-center justify-between gap-2">
              <h2 className="text-[24px] font-semibold">{exploredCity.city}</h2>
              <button type="button" onClick={() => setExploredCity(null)} aria-label="Back to featured story" className="flex h-11 w-11 items-center justify-center text-steel"><X size={18} /></button>
            </div>
            <ul className="mt-3 divide-y divide-hairline">
              {exploredCity.npcs.map((npc) => <li key={npc.handle} className="flex items-center justify-between gap-3 py-3">
                <span className="text-[16px] font-semibold">{npc.handle}</span><span className="text-[12px] text-steel">{npc.trait}</span>
              </li>)}
            </ul>
            <p className="mt-3 text-[13px] leading-relaxed text-steel">An imagined neighborhood. Choose a social scene below to see a complete story.</p>
          </>
        ) : (
          <>
            <h2 className="mt-5 text-[25px] font-semibold leading-tight tracking-[-0.025em]">{scenario.teaser}</h2>
            <p className="mt-4 text-[13px] text-steel">{scenario.actors[0].handle} + {scenario.actors[1].handle} · {scenario.label}</p>
            <a href="#encounter" className="npc-hero-story-link mt-5">
              Follow their story <ArrowRight size={15} />
            </a>
          </>
        )}
        <div className="mt-6 border-t border-hairline pt-5">
          <p className="npc-eyebrow npc-control-label">CHOOSE A SOCIAL SCENE</p>
          <div className="mt-3 grid grid-cols-3 gap-1" aria-label="Choose a social scene">
            {WORLD_SCENARIOS.map((story) => (
              <button key={story.id} type="button" className="npc-scenario-choice" data-scenario={story.id}
                aria-pressed={!exploredCity && scenario.id === story.id}
                onClick={() => selectCity(NPC_WORLD.find((city) => city.id === story.cityId)!)}>
                <span className="npc-scenario-name">{story.label}</span>
                <span className="npc-scenario-place">{story.city}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-steel">Illustrated people and places. No real profiles or permissions.</p>
      </aside>
    </div>
  );
}

function GlobeFallback({ loading = false, onRetry }: { loading?: boolean; onRetry?: () => void }) {
  return (
    <div className="npc-globe-fallback" role="status">
      <Globe2 size={96} strokeWidth={0.6} aria-hidden />
      <p>{loading ? "Opening the world…" : "The 3D view is unavailable."}</p>
      {!loading && <><p>You can still explore the city stories.</p><button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2"><RotateCcw size={14} />Try the globe again</button></>}
    </div>
  );
}

class GlobeBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
