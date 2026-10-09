import assert from "node:assert/strict";
import test from "node:test";
import { postFrame, threadDuration } from "../src/domain/world/playback.ts";
import { WORLD_SCENARIOS } from "../src/data/npcWorldPage.ts";
const posts = WORLD_SCENARIOS[0].posts;
const duration = threadDuration(posts.length);

test("the original post is readable immediately; two NPCs can compose at once", () => {
  assert.equal(postFrame(posts[0], 0, 0).text, posts[0].text);
  assert.equal(postFrame(posts[1], 1, 1000).state, "waiting");
  assert.equal(postFrame(posts[1], 1, 4000).state, "typing");
  assert.equal(postFrame(posts[2], 2, 4000).state, "typing");
  assert.equal(postFrame(posts[3], 3, 4000).state, "waiting");
});

test("scrubbing backwards restores the earlier discussion; end reveals every complete reply", () => {
  for (const scenario of WORLD_SCENARIOS) {
    for (const [index, post] of scenario.posts.entries()) {
      assert.deepEqual(postFrame(post, index, threadDuration(scenario.posts.length)), { state: "posted", text: post.text });
      if (index > 3) assert.equal(postFrame(post, index, 9000).state, "waiting");
    }
  }
  assert.equal(duration, 25500);
  assert.equal(postFrame(posts[3], 3, 12000).state, "typing");
  assert.equal(postFrame(posts[3], 3, 0).text, "");
});

test("each reply references an earlier post in its own thread", () => {
  for (const scenario of WORLD_SCENARIOS) {
    const seen = new Set();
    for (const post of scenario.posts) {
      assert.ok(!seen.has(post.id));
      if (post.replyTo) assert.ok(seen.has(post.replyTo));
      seen.add(post.id);
    }
    assert.equal(scenario.posts[3].replyTo, "perspective");
  }
});
