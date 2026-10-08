import assert from "node:assert/strict";
import test from "node:test";
import { NPC_WORLD } from "../src/data/npcWorld.ts";
import { WORLD_SCENARIOS } from "../src/data/npcWorldPage.ts";
import { PERMISSION_ORDER } from "../src/domain/world/model.ts";
import { storyReadingDuration } from "../src/domain/world/story.ts";

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
    assert.deepEqual(Object.keys(scenario.permissions).sort(), [...PERMISSION_ORDER].sort(), scenario.id);
  }
});

test("each story runs discover, connect, invite, continue", () => {
  for (const scenario of WORLD_SCENARIOS) {
    assert.deepEqual(scenario.steps.map((step) => step.kind), ["discover", "connect", "invite", "continue"], scenario.id);
  }
});

test("reading time per step is unchanged by rendering steps by kind", () => {
  // Values computed from the index-based implementation before steps had a kind.
  const before = {
    leisure: [9000, 10060, 10340, 11740],
    business: [9220, 10900, 11460, 12580],
    community: [9500, 10900, 12020, 12020],
  };
  for (const scenario of WORLD_SCENARIOS) {
    assert.deepEqual(scenario.steps.map((_, index) => storyReadingDuration(scenario, index)), before[scenario.id]);
  }
});
