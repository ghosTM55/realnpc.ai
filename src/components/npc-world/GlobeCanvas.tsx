"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Color, MeshBasicMaterial, Vector2, type Object3D } from "three";
import { NPC_WORLD } from "@/data/npcWorld";
import type { WorldCity } from "@/domain/world/model";
import { readTokens, withAlpha } from "@/lib/brandColors";
import { borderLines, countryPolygons, landMesh } from "./globeLayers";
import { limitPickingToCities } from "./globePicking";

export interface GlobeCanvasProps {
  countries: object[];
  width: number;
  height: number;
  active: boolean;
  reducedMotion: boolean;
  focused: boolean;
  selectedCity: WorldCity;
  onSelectCity: (city: WorldCity) => void;
}

const isWorldCity = (point: unknown): point is WorldCity => {
  if (!point || typeof point !== "object") return false;
  const city = point as Partial<WorldCity>;
  return typeof city.id === "string" && typeof city.city === "string" &&
    typeof city.lat === "number" && Number.isFinite(city.lat) &&
    typeof city.lng === "number" && Number.isFinite(city.lng) && Array.isArray(city.npcs);
};
const cityLat = (point: object) => isWorldCity(point) ? point.lat : 0;
const cityLng = (point: object) => isWorldCity(point) ? point.lng : 0;
const cityLabel = (point: object) => isWorldCity(point) ? `${point.city} · demo` : "";
// three-globe's globe radius in scene units.
const GLOBE_RADIUS = 100;
// This module only loads in the browser (dynamic import), so the VI tokens can be read once here.
const TOKENS = readTokens(["paper-white", "soul-blue", "powers-amber", "vessel-red", "globe-water"]);
// String props are property-name accessors in three-globe, so keep constant functions stable.
// Land and borders are each one custom-layer object; three-globe would draw 288 + 289.
// Built when three-globe asks, after its own globe objects exist: transparent objects with equal depth
// draw in creation order, and the water must come before the borders to hide those on the far side.
type StaticLayer = { build: () => Object3D };
const buildStaticLayer = (datum: object) => (datum as StaticLayer).build();
const keepStaticLayer = () => {};
// three-globe types its data props as mutable object[]; copy once so the array stays stable across renders.
const CITY_POINTS: object[] = [...NPC_WORLD];
const ringColor = () => [withAlpha(TOKENS["powers-amber"], 0.6), withAlpha(TOKENS["powers-amber"], 0)];

export default function GlobeCanvas({ countries, width, height, active, reducedMotion, focused, selectedCity, onSelectCity }: GlobeCanvasProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const globeMaterial = useMemo(() => new MeshBasicMaterial({
    color: new Color(TOKENS["globe-water"]), transparent: true, opacity: 0.9,
  }), []);
  useEffect(() => () => { globeMaterial.dispose(); }, [globeMaterial]);

  const polygons = useMemo(() => countryPolygons(countries), [countries]);
  // The border width is in screen pixels, so its material needs the canvas size.
  const borderResolution = useMemo(() => new Vector2(), []);
  useEffect(() => { borderResolution.set(width, height); }, [borderResolution, width, height]);
  const staticLayers = useMemo((): StaticLayer[] => !polygons.length ? [] : [
    { build: () => landMesh(polygons, GLOBE_RADIUS, { color: TOKENS["paper-white"], altitude: 0.005 }) },
    { build: () => borderLines(polygons.flat(), GLOBE_RADIUS, {
      color: TOKENS["soul-blue"], opacity: 0.9, altitude: 0.006, width: 1.6, resolution: borderResolution,
    }) },
  ], [polygons, borderResolution]);
  const rings = useMemo(() => !reducedMotion && active && focused ? [selectedCity] : [], [active, focused, reducedMotion, selectedCity]);
  const pointRadius = useCallback((point: object) => isWorldCity(point) && selectedCity.id === point.id ? 0.85 : 0.45, [selectedCity.id]);
  const pointColor = useCallback((point: object) => isWorldCity(point) && selectedCity.id === point.id ? TOKENS["powers-amber"] : TOKENS["vessel-red"], [selectedCity.id]);
  const onPointClick = useCallback((point: object) => { if (isWorldCity(point)) onSelectCity(point); }, [onSelectCity]);
  const autoRotate = active && !reducedMotion && !focused;
  const onPointHover = useCallback((point: object | null) => {
    if (globeRef.current) globeRef.current.controls().autoRotate = !point && autoRotate;
  }, [autoRotate]);

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
    return limitPickingToCities(globe.scene(), globe.camera());
  }, [ready]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !ready) return;
    globe.controls().autoRotate = autoRotate;
    if (active) globe.resumeAnimation();
    else globe.pauseAnimation();
  }, [active, autoRotate, ready]);

  useEffect(() => {
    if (!focused || !ready) return;
    globeRef.current?.pointOfView({ lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.55 }, reducedMotion ? 0 : 700);
  }, [focused, ready, reducedMotion, selectedCity]);

  return (
    <Globe ref={globeRef} width={width} height={height} onGlobeReady={configure}
      backgroundColor="rgba(0,0,0,0)" globeMaterial={globeMaterial}
      showAtmosphere atmosphereColor={TOKENS["soul-blue"]} atmosphereAltitude={0.12}
      customLayerData={staticLayers} customThreeObject={buildStaticLayer} customThreeObjectUpdate={keepStaticLayer}
      pointsData={CITY_POINTS} pointLat={cityLat} pointLng={cityLng} pointAltitude={0.007}
      pointRadius={pointRadius} pointColor={pointColor} pointLabel={cityLabel}
      onPointClick={onPointClick} onPointHover={onPointHover}
      ringsData={rings} ringLat={cityLat} ringLng={cityLng}
      ringMaxRadius={2.2} ringPropagationSpeed={1.2} ringRepeatPeriod={2200} ringColor={ringColor}
    />
  );
}
