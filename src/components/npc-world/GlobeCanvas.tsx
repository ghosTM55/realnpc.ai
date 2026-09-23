"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Color, MeshBasicMaterial } from "three";
import { NPC_WORLD, type WorldCity } from "@/data/npcWorld";

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
const pathLat = (point: number[]) => point[1];
const pathLng = (point: number[]) => point[0];
// String props are property-name accessors in three-globe, so keep constant functions stable.
const landColor = () => "#fbfbfc";
const borderColor = () => "rgba(67,169,201,0.9)";
const empty = () => "";
const ringColor = () => ["rgba(230,164,43,0.6)", "rgba(230,164,43,0)"];

export default function GlobeCanvas({ countries, width, height, active, reducedMotion, focused, selectedCity, onSelectCity }: GlobeCanvasProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const globeMaterial = useMemo(() => new MeshBasicMaterial({
    color: new Color("#d2e8f5"), transparent: true, opacity: 0.9,
  }), []);
  useEffect(() => () => { globeMaterial.dispose(); }, [globeMaterial]);

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
  const rings = useMemo(() => !reducedMotion && active && focused ? [selectedCity] : [], [active, focused, reducedMotion, selectedCity]);
  const pointRadius = useCallback((point: object) => isWorldCity(point) && selectedCity.id === point.id ? 0.85 : 0.45, [selectedCity.id]);
  const pointColor = useCallback((point: object) => isWorldCity(point) && selectedCity.id === point.id ? "#e6a42b" : "#d40d3d", [selectedCity.id]);
  const onPointClick = useCallback((point: object) => { if (isWorldCity(point)) onSelectCity(point); }, [onSelectCity]);
  const onPointHover = useCallback((point: object | null) => {
    if (globeRef.current) globeRef.current.controls().autoRotate = !point && active && !reducedMotion && !focused;
  }, [active, focused, reducedMotion]);

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
    globeRef.current?.pointOfView({ lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.55 }, reducedMotion ? 0 : 700);
  }, [focused, ready, reducedMotion, selectedCity]);

  return (
    <Globe ref={globeRef} width={width} height={height} onGlobeReady={configure}
      backgroundColor="rgba(0,0,0,0)" globeMaterial={globeMaterial}
      showAtmosphere atmosphereColor="#43a9c9" atmosphereAltitude={0.12}
      polygonsData={countries} polygonCapColor={landColor} polygonSideColor={empty}
      polygonAltitude={0.005} polygonsTransitionDuration={0} polygonLabel={empty}
      pathsData={borderPaths} pathPointLat={pathLat} pathPointLng={pathLng}
      pathPointAlt={0.006} pathColor={borderColor} pathStroke={1.6} pathTransitionDuration={0} pathLabel={empty}
      pointsData={NPC_WORLD} pointLat={cityLat} pointLng={cityLng} pointAltitude={0.007}
      pointRadius={pointRadius} pointColor={pointColor} pointLabel={cityLabel}
      onPointClick={onPointClick} onPointHover={onPointHover}
      ringsData={rings} ringLat={cityLat} ringLng={cityLng}
      ringMaxRadius={2.2} ringPropagationSpeed={1.2} ringRepeatPeriod={2200} ringColor={ringColor}
    />
  );
}
