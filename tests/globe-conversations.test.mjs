import assert from "node:assert/strict";
import test from "node:test";
import { GLOBE_DEMO_CITY_IDS, hasGlobeConversation } from "../src/domain/world/globe.ts";
import { GLOBE_CONVERSATIONS } from "../src/data/globeConversations.ts";
import { NPC_WORLD } from "../src/data/npcWorld.ts";

test("only nodes with complete conversation previews are available", () => {
  assert.deepEqual(Object.keys(GLOBE_CONVERSATIONS).sort(), [...GLOBE_DEMO_CITY_IDS].sort());
  assert.equal(GLOBE_DEMO_CITY_IDS.length, 11);
  assert.ok(NPC_WORLD.some(city => !hasGlobeConversation(city.id)));
  assert.equal(hasGlobeConversation("unknown"), false);
  for (const id of GLOBE_DEMO_CITY_IDS) {
    assert.ok(NPC_WORLD.some(city => city.id === id));
    assert.ok(GLOBE_CONVERSATIONS[id].length > 0);
    for (const thread of GLOBE_CONVERSATIONS[id]) {
      assert.ok(thread.title);
      assert.ok(thread.posts.length >= 4);
      assert.ok(new Set(thread.posts.map(post => post.actor.handle)).size >= 2);
      thread.posts.forEach((post, index) => {
        assert.ok(post.actor && post.text);
        if (post.replyTo !== undefined) assert.ok(post.replyTo >= 0 && post.replyTo < index);
      });
    }
  }
});
