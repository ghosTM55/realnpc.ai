import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CONFIG,
  DEFAULT_DRAFT,
  DEFAULT_REVIEW,
  getCompanionProfile,
  getScenePreview,
  parseDemoDraft,
  serializeDemoDraft,
  createReviewCase,
  createProfileText,
} from "../src/lib/companion.ts";

test("turning off both memory permissions removes remembered preferences and moments from the profile", () => {
  const profile = getCompanionProfile({
    ...DEFAULT_CONFIG,
    rememberPreferences: false,
    rememberMoments: false,
  });
  assert.equal(profile.memory.mode, "session-only");
  assert.deepEqual(profile.memory.items, []);
  assert.equal(profile.powers.includes("Memory thread"), false);
  assert.match(profile.memory.description, /no lasting memory/i);
});

test("a chosen companion survives all six steps without storing dialogue", () => {
  const draft = {
    ...DEFAULT_DRAFT,
    step: 5,
    unlockedStep: 5,
    config: {
      ...DEFAULT_CONFIG,
      soulId: "scout",
      form: "robot",
      rememberPreferences: false,
      rememberMoments: true,
    },
  };
  const serialized = serializeDemoDraft(draft);
  const restored = parseDemoDraft(serialized);
  assert.deepEqual(restored, draft);
  assert.equal(serialized.includes("reply"), false);
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

test("the same scenario produces three distinct personalities across intimacy, everyday life and a change of mind", () => {
  for (const scene of ["chemistry", "everyday", "boundary"]) {
    const previews = ["anchor", "instigator", "scout"].map((soulId) =>
      getScenePreview({ ...DEFAULT_CONFIG, soulId }, scene),
    );
    assert.equal(new Set(previews.map((preview) => preview.prompt)).size, 1);
    assert.equal(new Set(previews.map((preview) => preview.reply)).size, 3);
    assert.ok(
      previews.every(
        (preview) => preview.mode === "scripted" && preview.reply.length > 60,
      ),
    );
  }
});

test("the resulting next encounter reflects rhythm, initiative and allowed memory", () => {
  const quiet = getCompanionProfile({
    ...DEFAULT_CONFIG,
    rhythm: "unhurried",
    takesInitiative: false,
    rememberPreferences: false,
  });
  const playful = getCompanionProfile({
    ...DEFAULT_CONFIG,
    rhythm: "playful",
    takesInitiative: true,
  });
  assert.notEqual(quiet.nextEncounter.reply, playful.nextEncounter.reply);
  assert.match(quiet.nextEncounter.reply, /you.*ready/i);
  assert.match(playful.nextEncounter.reply, /remember/i);
  assert.equal(quiet.relationship, "Room to breathe");
  assert.equal(playful.relationship, "A shared spark");
  assert.equal(quiet.powers.includes("First move"), false);
  assert.ok(playful.powers.includes("First move"));
});

test("a build preview carries the chosen Soul and effective privacy, never an order or a submission", () => {
  const review = createReviewCase(
    {
      ...DEFAULT_CONFIG,
      soulId: "instigator",
      form: "robot",
      rememberPreferences: false,
      rememberMoments: false,
    },
    DEFAULT_REVIEW,
  );
  assert.equal(review.status, "local-draft");
  assert.equal(review.companion.name, "Vex");
  assert.equal(review.companion.memory.mode, "session-only");
  assert.match(review.path.title, /physical/i);
  assert.ok(
    review.reviewNotes.some((note) => /hardware.*feasibility/i.test(note)),
  );
  assert.equal(review.submitted, false);
  assert.equal("price" in review, false);
});

test("optional review selections survive a reload and license / budget constraints appear in the preview", () => {
  const review = {
    ...DEFAULT_REVIEW,
    characterSource: "licensed",
    budget: "under-10k",
    priority: "presence",
  };
  const restored = parseDemoDraft(
    serializeDemoDraft({ ...DEFAULT_DRAFT, review, step: 5, unlockedStep: 5 }),
  );
  assert.deepEqual(restored.review, review);
  assert.equal(restored.step, 5);
  const result = createReviewCase(
    { ...DEFAULT_CONFIG, form: "robot" },
    restored.review,
  );
  assert.ok(result.reviewNotes.some((note) => /rights.*verified/i.test(note)));
  assert.ok(result.reviewNotes.some((note) => /budget.*scope/i.test(note)));
  assert.match(result.path.why, /presence/i);
});

test("a permitted shared moment changes the next encounter without claiming remembered preferences", () => {
  const fresh = getCompanionProfile({
    ...DEFAULT_CONFIG,
    rememberPreferences: false,
    rememberMoments: false,
  });
  const remembered = getCompanionProfile({
    ...DEFAULT_CONFIG,
    rememberPreferences: false,
    rememberMoments: true,
  });
  assert.notEqual(fresh.nextEncounter.reply, remembered.nextEncounter.reply);
  assert.match(remembered.nextEncounter.reply, /changed your mind/i);
  assert.doesNotMatch(
    remembered.nextEncounter.reply,
    /remember the pace|start fresh/i,
  );
});

test("each Soul keeps a distinct voice throughout the resulting encounter, not only its opening", () => {
  for (const rhythm of ["unhurried", "playful", "direct"]) {
    const replies = ["anchor", "instigator", "scout"].map(
      (soulId) =>
        getCompanionProfile({ ...DEFAULT_CONFIG, soulId, rhythm }).nextEncounter
          .reply,
    );
    const endings = replies.map((reply) =>
      reply.slice(reply.indexOf(".") + 1).trim(),
    );
    assert.equal(new Set(endings).size, 3);
  }
});

test("the plan preview keeps Soul-specific responses and effective memory", () => {
  const plans = ["anchor", "instigator", "scout"].map((soulId) => {
    const profile = getCompanionProfile({
      ...DEFAULT_CONFIG,
      soulId,
      rememberPreferences: false,
      rememberMoments: false,
    });
    assert.equal(profile.planEncounter.title, "A plan for tonight");
    assert.notEqual(profile.planEncounter.prompt, profile.nextEncounter.prompt);
    assert.notEqual(profile.planEncounter.reply, profile.nextEncounter.reply);
    assert.doesNotMatch(profile.planEncounter.reply, /remember|last time/i);
    return profile.planEncounter.reply;
  });
  assert.equal(new Set(plans).size, 3);
  const withMoment = getCompanionProfile({
    ...DEFAULT_CONFIG,
    rememberMoments: true,
  });
  assert.match(withMoment.planEncounter.reply, /changed your mind/i);
});

test("the readable keepsake contains the effective profile, not dialogue or forbidden memory", () => {
  const text = createProfileText({
    ...DEFAULT_CONFIG,
    soulId: "scout",
    rememberPreferences: false,
    rememberMoments: false,
    takesInitiative: false,
  });
  assert.match(text, /Kite/);
  assert.match(text, /Playfully unpredictable/);
  assert.match(text, /No lasting memory/);
  assert.match(text, /Waits for your invitation/);
  assert.match(text, /Scripted demo/);
  assert.doesNotMatch(text, /Memory thread|First move|I'm back|Suppose we had/);
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
    review: { ...DEFAULT_REVIEW, characterSource: "licensed" },
  };
  const migrated = parseDemoDraft(JSON.stringify(legacy));
  assert.equal(migrated.version, 3);
  assert.equal(migrated.step, 0);
  assert.equal(migrated.unlockedStep, 0);
  assert.deepEqual(migrated.config, legacy.config);
  assert.deepEqual(migrated.review, legacy.review);
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
    step: 5,
    config: { ...DEFAULT_CONFIG, soulId: "scout", form: "robot" },
  };
  const restored = parseDemoDraft(JSON.stringify(old));
  assert.equal(restored.step, 0);
  assert.equal(restored.unlockedStep, 0);
  assert.deepEqual(restored.config, old.config);
});

test("saved navigation preserves unlocked progress when revisiting an earlier step", () => {
  const draft = { ...DEFAULT_DRAFT, step: 1, unlockedStep: 3 };
  assert.deepEqual(parseDemoDraft(serializeDemoDraft(draft)), draft);
});

test("restored navigation cannot exceed completed progress or trust invalid progress", () => {
  const clamped = parseDemoDraft(
    JSON.stringify({ ...DEFAULT_DRAFT, step: 5, unlockedStep: 2 }),
  );
  assert.equal(clamped.step, 2);
  assert.equal(clamped.unlockedStep, 2);
  for (const unlockedStep of [-1, 6, 1.5, "5", null]) {
    const restored = parseDemoDraft(
      JSON.stringify({ ...DEFAULT_DRAFT, step: 5, unlockedStep }),
    );
    assert.equal(restored.step, 0);
    assert.equal(restored.unlockedStep, 0);
  }
});
