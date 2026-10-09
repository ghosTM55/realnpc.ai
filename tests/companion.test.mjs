import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_DRAFT,
  normalizeDemoDraft,
  parseDemoDraft,
  serializeDemoDraft,
} from "../src/domain/companion/draft.ts";
import { DEFAULT_CONFIG, SOUL_IDENTITIES, VESSEL_FORMS } from "../src/domain/companion/model.ts";
import { NPC_FORMS } from "../src/domain/npc.ts";

test("a chosen companion survives all five steps without storing dialogue", () => {
  const draft = {
    ...DEFAULT_DRAFT,
    step: 4,
    unlockedStep: 4,
    config: {
      ...DEFAULT_CONFIG,
      ...SOUL_IDENTITIES.scout,
      soulId: "scout",
      form: "robot",
      rememberPreferences: false,
      rememberMoments: true,
    },
  };
  const serialized = serializeDemoDraft(draft);
  const restored = parseDemoDraft(serialized);
  assert.deepEqual(restored, draft);
  assert.equal(serialized.includes('"reply"'), false);
  assert.equal(serialized.includes("prompt"), false);
});

test("untrusted or obsolete browser drafts fall back safely, without merging unknown fields", () => {
  for (const value of [
    "broken",
    "null",
    '{"version":99}',
    JSON.stringify({
      ...DEFAULT_DRAFT,
      config: { ...DEFAULT_CONFIG, soulId: "not-a-soul" },
    }),
  ]) {
    assert.deepEqual(parseDemoDraft(value), DEFAULT_DRAFT);
  }
  const restored = parseDemoDraft(
    JSON.stringify({
      ...DEFAULT_DRAFT,
      privateConversation: "do not retain",
      config: { ...DEFAULT_CONFIG, secret: "do not retain" },
    }),
  );
  assert.equal("privateConversation" in restored, false);
  assert.equal("secret" in restored.config, false);
});

test("obsolete review fields are discarded without losing current configuration or progress", () => {
  const review = {
    characterSource: "licensed",
    budget: "under-10k",
    priority: "presence",
    service: "software",
  };
  const restored = parseDemoDraft(
    serializeDemoDraft({ ...DEFAULT_DRAFT, review, step: 3, unlockedStep: 3 }),
  );
  assert.equal("review" in restored, false);
  assert.equal(restored.step, 3);
  assert.deepEqual(restored.config, DEFAULT_CONFIG);
});

test("existing two-flow drafts migrate without losing the chosen companion or permissions", () => {
  const legacy = {
    version: 1,
    labStep: 3,
    reviewStep: 1,
    config: {
      ...DEFAULT_CONFIG,
      soulId: "instigator",
      rememberPreferences: false,
    },
    review: { priority: "privacy", characterSource: "licensed", budget: "discuss", service: "discuss" },
  };
  const migrated = parseDemoDraft(JSON.stringify(legacy));
  assert.equal(migrated.version, 5);
  assert.equal(migrated.step, 0);
  assert.equal(migrated.unlockedStep, 0);
  assert.equal(migrated.config.soulId, legacy.config.soulId);
  assert.equal(migrated.config.rememberPreferences, false);
  assert.equal(migrated.config.age, 34);
  assert.equal("review" in migrated, false);
  assert.equal("labStep" in migrated, false);
  assert.equal("reviewStep" in migrated, false);
  assert.equal(
    parseDemoDraft(JSON.stringify({ ...legacy, labStep: 1 })).step,
    0,
  );
  for (const step of [-1, 6, 1.5]) {
    assert.deepEqual(
      parseDemoDraft(JSON.stringify({ ...DEFAULT_DRAFT, step })),
      DEFAULT_DRAFT,
    );
  }
});

test("older unrestricted drafts retain choices but do not count skipped steps as completed", () => {
  const old = {
    ...DEFAULT_DRAFT,
    version: 2,
    step: 3,
    config: { ...DEFAULT_CONFIG, soulId: "scout", form: "robot" },
  };
  const restored = parseDemoDraft(JSON.stringify(old));
  assert.equal(restored.step, 0);
  assert.equal(restored.unlockedStep, 0);
  assert.equal(restored.config.soulId, old.config.soulId);
  assert.equal(restored.config.form, old.config.form);
  assert.equal(restored.config.assembly, "preset");
});

test("saved navigation preserves unlocked progress when revisiting an earlier step", () => {
  const draft = { ...DEFAULT_DRAFT, step: 1, unlockedStep: 3 };
  assert.deepEqual(parseDemoDraft(serializeDemoDraft(draft)), draft);
});

test("restored navigation cannot exceed completed progress or trust invalid progress", () => {
  const clamped = parseDemoDraft(
    JSON.stringify({ ...DEFAULT_DRAFT, step: 3, unlockedStep: 2 }),
  );
  assert.equal(clamped.step, 2);
  assert.equal(clamped.unlockedStep, 2);
  for (const unlockedStep of [-1, 6, 1.5, "5", null]) {
    const restored = parseDemoDraft(
      JSON.stringify({ ...DEFAULT_DRAFT, step: 3, unlockedStep }),
    );
    assert.equal(restored.step, 0);
    assert.equal(restored.unlockedStep, 0);
  }
});

test("the Vessel choice is every NPC form plus undecided", () => {
  assert.deepEqual([...VESSEL_FORMS].sort(), [...NPC_FORMS, "undecided"].sort());
});

test("normalizing a draft clamps progress exactly as reloading it from storage would", () => {
  const draft = { ...DEFAULT_DRAFT, step: 3, unlockedStep: 2 };
  assert.deepEqual(normalizeDemoDraft(draft), parseDemoDraft(serializeDemoDraft(draft)));
  assert.equal(normalizeDemoDraft(draft).step, 2);
  assert.equal(serializeDemoDraft(draft), JSON.stringify(normalizeDemoDraft(draft)));
});
