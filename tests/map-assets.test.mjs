import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { WORLD_MAP_URL } from "../src/data/worldMap.ts";

test("published map preserves all source geometry and uses its content hash", async () => {
  const source = JSON.parse(await readFile(new URL("../assets/data/countries-110m.geojson", import.meta.url)));
  const bytes = await readFile(new URL(`../public${WORLD_MAP_URL}`, import.meta.url));
  const published = JSON.parse(bytes);
  assert.equal(published.type, "FeatureCollection");
  assert.deepEqual(published.features.map(feature => feature.geometry), source.features.map(feature => feature.geometry));
  assert.ok(published.features.every(feature => feature.type === "Feature" && Object.keys(feature.properties).length === 0));
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  assert.equal(WORLD_MAP_URL, `/data/countries-110m.${hash}.geojson`);
});
