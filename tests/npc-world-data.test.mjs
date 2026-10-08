import assert from "node:assert/strict";
import test from "node:test";
import { NPC_WORLD } from "../src/data/npcWorld.ts";
import { WORLD_SCENARIOS } from "../src/data/npcWorldPage.ts";

// Placeholder globe NPCs that reuse a story actor's handle with a different persona.
// Renaming them is a product decision that is deliberately deferred; this list keeps
// any new collision from slipping in unnoticed.
const KNOWN_DUPLICATE_HANDLES = ["Atlas", "Haneul", "Mira", "Nova"];

test("every city id is unique and every story names an existing city", () => {
  const ids = NPC_WORLD.map((city) => city.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const scenario of WORLD_SCENARIOS) {
    const city = NPC_WORLD.find((item) => item.id === scenario.cityId);
    assert.ok(city, `${scenario.id}: unknown city ${scenario.cityId}`);
    assert.equal(scenario.city, city.city);
  }
});

test("both story actors live in their story's city, as the same identity", () => {
  for (const scenario of WORLD_SCENARIOS) {
    const city = NPC_WORLD.find((item) => item.id === scenario.cityId);
    for (const actor of scenario.actors) {
      assert.ok(city.npcs.includes(actor), `${scenario.id}: ${actor.handle} is not in ${city.city}`);
    }
  }
});

test("handles are unique within a city and only known handles repeat across cities", () => {
  const seen = new Map();
  for (const city of NPC_WORLD) {
    const handles = city.npcs.map((npc) => npc.handle);
    assert.equal(new Set(handles).size, handles.length, `${city.city} repeats a handle`);
    for (const npc of city.npcs) seen.set(npc.handle, [...(seen.get(npc.handle) ?? []), npc]);
  }
  const duplicated = [...seen].filter(([, npcs]) => new Set(npcs).size > 1).map(([handle]) => handle).sort();
  assert.deepEqual(duplicated, KNOWN_DUPLICATE_HANDLES);
});

test("each story offers every permission exactly once", () => {
  for (const scenario of WORLD_SCENARIOS) {
    const ids = scenario.permissions.map((permission) => permission.id).sort();
    assert.deepEqual(ids, ["interest", "location", "memory"], scenario.id);
  }
});
