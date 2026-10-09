"use client";

import { Component, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { preload } from "react-dom";
import { ArrowRight, Globe2, RotateCcw } from "lucide-react";
import type { GlobeCanvasProps } from "./GlobeCanvas";
import { NPC_WORLD_PAGE } from "@/data/npcWorldPage";
import { getCity } from "@/data/npcWorld";
import { GLOBE_DEMO_CITY_IDS, hasGlobeConversation } from "@/domain/world/globe";
import type { WorldCity } from "@/domain/world/model";
import { useSceneActivity } from "./useSceneActivity";
import { WORLD_MAP_URL } from "@/data/worldMap";

export default function GlobeNpcExplorer() {
  preload(WORLD_MAP_URL, { as: "fetch", crossOrigin: "anonymous" });
  const wrapRef = useRef<HTMLDivElement>(null);
  const { active, reducedMotion } = useSceneActivity(wrapRef);
  const [GlobeComp, setGlobeComp] = useState<ComponentType<GlobeCanvasProps> | null>(null);
  const [countries, setCountries] = useState<object[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedCity, setSelectedCity] = useState<WorldCity | null>(null);
  const [keyboardSelection, setKeyboardSelection] = useState(false);
  const citySelect = useRef<HTMLSelectElement>(null);
  const selectCity = useCallback((city: WorldCity) => {
    if (!hasGlobeConversation(city.id)) return;
    setKeyboardSelection(false);
    setSelectedCity(city);
  }, []);
  const closeConversation = useCallback((restoreFocus: boolean) => {
    setSelectedCity(null);
    if (restoreFocus) citySelect.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    Promise.all([
      import("./GlobeCanvas"),
      fetch(WORLD_MAP_URL, { signal: controller.signal })
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

  const retry = () => {
    setLoadError(false);
    setGlobeComp(null);
    setAttempt((value) => value + 1);
  };

  return (
    <div className="npc-globe-hero">
      <div className="npc-hero-copy">
        <p data-hero-item className="npc-eyebrow npc-section-kicker">{NPC_WORLD_PAGE.hero.kicker}</p>
        <h1 data-hero-item className="npc-hero-title font-display">{NPC_WORLD_PAGE.hero.title}</h1>
        <p data-hero-item className="npc-hero-summary">{NPC_WORLD_PAGE.hero.sub}</p>
        <a data-hero-item href="#encounter" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-vessel">
          Step inside World <ArrowRight size={15} />
        </a>
      </div>

      <div className="npc-globe-stage">
      <div ref={wrapRef} className="npc-globe-canvas" role="region" aria-label="Explore the NPC World demo globe">
        {loadError ? <GlobeFallback onRetry={retry} /> : GlobeComp && dims.w > 0 ? (
          <GlobeBoundary key={attempt} fallback={<GlobeFallback onRetry={retry} />}>
            <GlobeComp countries={countries} width={dims.w} height={dims.h}
              active={active} reducedMotion={reducedMotion} keyboardSelection={keyboardSelection}
              selectedCity={selectedCity} onSelectCity={selectCity} onDismiss={closeConversation}
            />
          </GlobeBoundary>
        ) : <GlobeFallback loading />}
      </div>
        <div className="npc-globe-tools">
          <p><span className="npc-node-key" />Conversations<span className="npc-node-key" data-muted="true" />No preview yet</p>
          <label><span className="sr-only">Explore city conversations</span><select ref={citySelect} value={selectedCity?.id ?? ""} disabled={!GlobeComp || loadError} onChange={(event) => {
            if (!hasGlobeConversation(event.target.value)) return;
            setKeyboardSelection(true);
            setSelectedCity(getCity(event.target.value));
          }}><option value="" disabled>Choose a city</option>{GLOBE_DEMO_CITY_IDS.map((id) => <option key={id} value={id}>{getCity(id).city}</option>)}</select></label>
        </div>
      </div>
    </div>
  );
}

function GlobeFallback({ loading = false, onRetry }: { loading?: boolean; onRetry?: () => void }) {
  return (
    <div className="npc-globe-fallback" role="status">
      <Globe2 size={96} strokeWidth={0.6} aria-hidden />
      <p>{loading ? "Opening the world…" : "The 3D view is unavailable."}</p>
      {!loading && <><p>You can still explore the NPC conversations.</p><button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2"><RotateCcw size={14} />Try the globe again</button></>}
    </div>
  );
}

class GlobeBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
