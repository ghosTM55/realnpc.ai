import { Color, DoubleSide, Mesh, MeshBasicMaterial, type BufferGeometry, type Vector2 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import ConicPolygonGeometry from "three-conic-polygon-geometry";

// Land and borders as one mesh and one line object instead of three-globe's
// one Mesh per polygon (288) and one Line2 per ring (289). The geometry is
// built exactly as three-globe 2.45 builds its polygons and fat-line paths.

type Ring = number[][];
type Polygon = Ring[];

/** Each Polygon, and each part of a MultiPolygon, as three-globe splits them. */
export function countryPolygons(countries: object[]): Polygon[] {
  const polygons: Polygon[] = [];
  for (const feature of countries) {
    const geometry = (feature as { geometry?: { type: string; coordinates: unknown } }).geometry;
    if (geometry?.type === "Polygon") polygons.push(geometry.coordinates as Polygon);
    else if (geometry?.type === "MultiPolygon") polygons.push(...geometry.coordinates as Polygon[]);
  }
  return polygons;
}

const polar2Cartesian = (lat: number, lng: number, altitude: number, radius: number) => {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (90 - lng) * Math.PI / 180;
  const r = radius * (1 + altitude);
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
};

/** three-globe's path interpolation: extra points every `maxDegrees`, crossing the antimeridian the short way. */
export function interpolateRing(ring: Ring, maxDegrees = 2) {
  const result: [lat: number, lng: number][] = [];
  let previous: [number, number] | null = null;
  for (const [lng, lat] of ring) {
    const point: [number, number] = [lat, lng];
    if (previous) {
      while (Math.abs(previous[1] - point[1]) > 180) previous[1] += 360 * (previous[1] < point[1] ? 1 : -1);
      const distance = Math.hypot(point[0] - previous[0], point[1] - previous[1]);
      if (distance > maxDegrees) {
        const extra = Math.floor(distance / maxDegrees);
        for (let i = 1; i <= extra; i++) {
          result.push([
            previous[0] + (point[0] - previous[0]) * i / (extra + 1),
            previous[1] + (point[1] - previous[1]) * i / (extra + 1),
          ]);
        }
      }
    }
    result.push(previous = point);
  }
  return result;
}

export function landMesh(polygons: Polygon[], radius: number, { color, altitude }: { color: string; altitude: number }) {
  // Cap only: three-globe's closedTop polygon without sides, curvature resolution 5°.
  const parts: BufferGeometry[] = polygons.map((polygon) => new ConicPolygonGeometry(polygon, 0, radius, false, true, false, 5));
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Land polygons could not be merged");
  geometry.clearGroups();
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: new Color(color), side: DoubleSide }));
  mesh.scale.setScalar(1 + altitude);
  return mesh;
}

export function borderLines(
  rings: Ring[],
  radius: number,
  { color, opacity, altitude, width, resolution }: { color: string; opacity: number; altitude: number; width: number; resolution: Vector2 },
) {
  const segments: number[] = [];
  for (const ring of rings) {
    const points = interpolateRing(ring).map(([lat, lng]) => polar2Cartesian(lat, lng, altitude, radius));
    for (let i = 1; i < points.length; i++) segments.push(...points[i - 1], ...points[i]);
  }
  const material = new LineMaterial({ color: new Color(color), linewidth: width, transparent: opacity < 1, opacity });
  // Shared, so a canvas resize reaches the shader without rebuilding the lines.
  material.uniforms.resolution.value = resolution;
  const lines = new LineSegments2(new LineSegmentsGeometry().setPositions(segments), material);
  // Draw before the translucent water, so far-side borders always show faintly through it, like
  // far-side city points. With one Line2 per ring, three.js sorted each ring against the water by
  // its own centre, so some far-side borders showed and others did not, changing as the globe turned.
  lines.renderOrder = -1;
  return lines;
}
