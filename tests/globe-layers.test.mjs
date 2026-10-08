import test from "node:test";
import assert from "node:assert/strict";
import { Vector2 } from "three";

// three-conic-polygon-geometry checks window.THREE at import time.
globalThis.window ??= {};
const { borderLines, countryPolygons, interpolateRing, landMesh } = await import("../src/components/npc-world/globeLayers.ts");

const square = [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]];
const countries = [
  { geometry: { type: "Polygon", coordinates: square } },
  { geometry: { type: "MultiPolygon", coordinates: [square, [[[20, 20], [21, 20], [21, 21], [20, 20]]]] } },
  { geometry: null },
];

test("countries split into polygons the way three-globe splits them", () => {
  assert.equal(countryPolygons(countries).length, 3);
  assert.equal(countryPolygons(countries).flat().length, 3, "one ring each");
});

test("rings gain a point every 2° and cross the antimeridian the short way, as three-globe paths do", () => {
  const points = interpolateRing([[170, 0], [-170, 0]]);
  assert.equal(points.length, 12, "20° apart: 10 interpolated points between the ends");
  assert.deepEqual(points[0], [0, -190], "the start is unwrapped towards the end");
  assert.deepEqual(points.at(-1), [0, -170]);
  assert.deepEqual(interpolateRing([[0, 0], [1, 1]]), [[0, 0], [1, 1]], "short edges are kept as is");
});

test("land is one mesh and borders one line object, sized like three-globe's layers", () => {
  const polygons = countryPolygons(countries);
  const land = landMesh(polygons, 100, { color: "#ffffff", altitude: 0.005 });
  assert.equal(land.geometry.groups.length, 0, "one draw range");
  assert.equal(land.scale.x, 1.005);
  const resolution = new Vector2(800, 600);
  const borders = borderLines(polygons.flat(), 100, { color: "#43a9c9", opacity: 0.9, altitude: 0.006, width: 1.6, resolution });
  const segments = polygons.flat().reduce((sum, ring) => sum + interpolateRing(ring).length - 1, 0);
  assert.equal(borders.geometry.getAttribute("instanceStart").count, segments);
  assert.equal(borders.material.uniforms.resolution.value, resolution, "a resize reaches the shader");
  assert.ok(borders.material.transparent);
  const radius = Math.hypot(...borders.geometry.getAttribute("instanceStart").array.slice(0, 3));
  assert.ok(Math.abs(radius - 100.6) < 1e-3);
});
