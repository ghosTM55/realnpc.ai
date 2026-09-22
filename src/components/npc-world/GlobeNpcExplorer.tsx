"use client";

import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Globe2, RotateCcw, X } from "lucide-react";
import * as THREE from "three";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";
import { NPC_WORLD_PAGE, WORLD_SCENARIOS, type ScenarioId, type WorldScenario } from "@/data/npcWorldPage";
import { NPC_WORLD, type WorldCity } from "@/data/npcWorld";
import { useSceneActivity } from "./useWorldPlayback";

type GlobeComponent = React.ForwardRefExoticComponent<GlobeProps & React.RefAttributes<GlobeMethods>>;
const TONE_HEX = { vessel: "#d40d3d", soul: "#43a9c9", powers: "#e6a42b" } as const;
const isWorldCity = (point: unknown): point is WorldCity => {
  if (!point || typeof point !== "object") return false;
  const city = point as Partial<WorldCity>;
  return typeof city.id === "string" && typeof city.city === "string" &&
    typeof city.lat === "number" && Number.isFinite(city.lat) &&
    typeof city.lng === "number" && Number.isFinite(city.lng) && Array.isArray(city.npcs);
};
const cityLat = (point: object) => isWorldCity(point) ? point.lat : 0;
const cityLng = (point: object) => isWorldCity(point) ? point.lng : 0;

export default function GlobeNpcExplorer({ scenario, onScenarioChange }: {
  scenario: WorldScenario;
  onScenarioChange: (id: ScenarioId) => void;
}) {
  const globeRef = useRef<GlobeMethods | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { active, reducedMotion } = useSceneActivity(wrapRef);
  const [GlobeComp, setGlobeComp] = useState<GlobeComponent | null>(null);
  const [countries, setCountries] = useState<object[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [exploredCity, setExploredCity] = useState<WorldCity | null>(null);
  const [focused, setFocused] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const selectedCity = exploredCity ?? NPC_WORLD.find((city) => city.id === scenario.cityId)!;
  const globeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("#d2e8f5"), transparent: true, opacity: 0.9,
  }), []);

  const borderPaths = useMemo(() => {
    const paths: number[][][] = [];
    for (const feature of countries) {
      const geometry = (feature as { geometry?: { type: string; coordinates: unknown } }).geometry;
      if (geometry?.type === "Polygon") paths.push(...geometry.coordinates as number[][][]);
      else if (geometry?.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates as number[][][][]) paths.push(...polygon);
      }
    }
    return paths;
  }, [countries]);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    Promise.all([
      import("react-globe.gl"),
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
      setGlobeComp(() => module.default as unknown as GlobeComponent);
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

  useEffect(() => () => { globeMaterial.dispose(); }, [globeMaterial]);

  const configure = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    globe.controls().enableZoom = false;
    globe.controls().autoRotateSpeed = 0.35;
    globe.pointOfView({ lat: 32, lng: 125, altitude: 1.65 });
    setReady(true);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !ready) return;
    globe.controls().autoRotate = active && !reducedMotion && !focused;
    if (active) globe.resumeAnimation();
    else globe.pauseAnimation();
  }, [active, focused, ready, reducedMotion]);

  useEffect(() => {
    if (!focused || !ready) return;
    globeRef.current?.pointOfView(
      { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.55 },
      reducedMotion ? 0 : 700,
    );
  }, [focused, ready, reducedMotion, selectedCity]);

  const selectCity = (city: WorldCity) => {
    const story = WORLD_SCENARIOS.find((item) => item.cityId === city.id);
    setFocused(true);
    if (story) { setExploredCity(null); onScenarioChange(story.id); }
    else setExploredCity(city);
  };
  const retry = () => {
    setLoadError(false);
    setReady(false);
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
            <GlobeComp ref={globeRef} width={dims.w} height={dims.h} onGlobeReady={configure}
              backgroundColor="rgba(0,0,0,0)" globeMaterial={globeMaterial}
              showAtmosphere atmosphereColor="#43a9c9" atmosphereAltitude={0.12}
              polygonsData={countries} polygonCapColor={() => "#fbfbfc"} polygonSideColor={() => "rgba(0,0,0,0)"}
              polygonStrokeColor={() => "rgba(0,0,0,0)"} polygonAltitude={0.005} polygonsTransitionDuration={0} polygonLabel={() => ""}
              pathsData={borderPaths} pathPointLat={(p: number[]) => p[1]} pathPointLng={(p: number[]) => p[0]}
              pathPointAlt={0.006} pathColor={() => "rgba(67,169,201,0.9)"} pathStroke={1.6} pathTransitionDuration={0} pathLabel={() => ""}
              pointsData={NPC_WORLD} pointLat={cityLat} pointLng={cityLng} pointAltitude={0.007}
              pointRadius={(point: object) => isWorldCity(point) && selectedCity.id === point.id ? 0.85 : 0.45}
              pointColor={(point: object) => isWorldCity(point) && selectedCity.id === point.id ? TONE_HEX.powers : TONE_HEX.vessel}
              pointLabel={(point: object) => isWorldCity(point) ? point.city + " · demo" : ""}
              onPointClick={(point: object) => { if (isWorldCity(point)) selectCity(point); }}
              onPointHover={(point: object | null) => {
                if (globeRef.current) globeRef.current.controls().autoRotate = !point && active && !reducedMotion && !focused;
              }}
              ringsData={!reducedMotion && active && focused ? [selectedCity] : []}
              ringLat={cityLat} ringLng={cityLng} ringMaxRadius={2.2} ringPropagationSpeed={1.2} ringRepeatPeriod={2200}
              ringColor={() => ["rgba(230,164,43,0.6)", "rgba(230,164,43,0)"]}
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
