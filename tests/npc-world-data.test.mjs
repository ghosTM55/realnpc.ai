import assert from "node:assert/strict";
import test from "node:test";
import { NPC_WORLD, STORY_ACTORS } from "../src/data/npcWorld.ts";
import { WORLD_SCENARIOS } from "../src/data/npcWorldPage.ts";
import { SOULS, getSoul } from "../src/domain/companion/model.ts";
import { getScenario } from "../src/domain/world/story.ts";

test("every city id is unique and every conversation names an existing city", () => {
  assert.equal(new Set(NPC_WORLD.map((city) => city.id)).size, NPC_WORLD.length);
  for (const scenario of WORLD_SCENARIOS) {
    const city = NPC_WORLD.find((item) => item.id === scenario.cityId);
    assert.ok(city);
    assert.equal(scenario.city, city.city);
    assert.equal(getScenario(scenario.id), scenario);
    for (const actor of scenario.actors) assert.ok(city.npcs.includes(actor));
  }
});

test("World identities use the same names and personalities as the configurator", () => {
  assert.deepEqual(SOULS.map((soul) => soul.name), ["Chloe", "Mia", "Raymond"]);
  for (const actor of Object.values(STORY_ACTORS)) {
    const soul = getSoul(actor.soulId);
    assert.equal(actor.handle, soul.name);
    assert.equal(actor.persona, soul.signature);
    assert.equal(actor.trait, soul.archetype);
  }
});

test("city identities remain distinct and recurring featured NPCs share one record", () => {
  const featured = new Set(Object.values(STORY_ACTORS).map((actor) => actor.handle));
  for (const city of NPC_WORLD) {
    assert.equal(new Set(city.npcs.map((npc) => npc.handle)).size, city.npcs.length);
    for (const npc of city.npcs) {
      if (featured.has(npc.handle)) assert.ok(Object.values(STORY_ACTORS).includes(npc));
    }
  }
});

test("each conversation includes at least two shared personalities and something to bring home", () => {
  for (const scenario of WORLD_SCENARIOS) {
    assert.ok(new Set(scenario.posts.map((post) => post.actor.handle)).size >= 2);
    for (const post of scenario.posts) assert.ok(Object.values(STORY_ACTORS).includes(post.actor));
    assert.ok(scenario.discovery.title && scenario.discovery.detail && scenario.takeaway && scenario.relationship);
  }
});
