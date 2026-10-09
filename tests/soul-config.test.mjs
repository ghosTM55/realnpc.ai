import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_DRAFT, parseDemoDraft, serializeDemoDraft } from '../src/domain/companion/draft.ts';
import { parseSoulReply } from '../src/domain/companion/chat.ts';

test('a valid NPC mood is preserved independently of relationship progression', () => {
  assert.deepEqual(parseSoulReply({ reply: 'That sounds difficult. I am listening.', relationship: 'friends', mood: 'concerned' }, 'friends'), {
    reply: 'That sounds difficult. I am listening.', relationship: 'friends', mood: 'concerned',
  });
});

test('legacy replies and untrusted moods keep the message without inventing an emotional state', () => {
  for (const mood of [undefined, null, 'jealous', '<script>alert(1)</script>', {}, 3]) {
    assert.deepEqual(parseSoulReply({ reply: 'Hello.', relationship: 'strangers', mood }, 'strangers'), { reply: 'Hello.', relationship: 'strangers' });
  }
  assert.deepEqual(parseSoulReply({ reply: 'Happy to talk.', relationship: 'partner', mood: 'happy' }, 'strangers'), { reply: 'Happy to talk.', relationship: 'strangers', mood: 'happy' });
});

test('current draft uses fixed character identity while retaining personality and assembly choices', () => {
  const draft = { ...DEFAULT_DRAFT, step: 3, unlockedStep: 3, config: { ...DEFAULT_DRAFT.config,
    name: 'Nova', gender: 'nonbinary', age: 32, background: 'A night-shift astronomer.',
    personality: { friends: 'playful', strangers: 'thoughtful', partner: 'warm' }, assembly: 'custom',
  }};
  const restored = parseDemoDraft(serializeDemoDraft(draft));
  assert.equal(restored.version, 5);
  assert.equal(restored.config.name, '');
  assert.equal(restored.config.age, 28);
  assert.equal(restored.config.gender, 'female');
  assert.match(restored.config.background, /bookshop owner/);
  assert.equal(restored.config.personality.strangers, 'thoughtful');
  assert.equal(restored.config.assembly, 'custom');
  assert.equal(restored.step, 3);
});

test('legacy six-step drafts retain choices and restart at character selection', () => {
  const legacy = { version: 3, step: 5, unlockedStep: 5, config: {
    soulId: 'instigator', rhythm: 'direct', form: 'robot', takesInitiative: false,
    rememberPreferences: false, rememberMoments: true, worldVisible: true,
  }};
  const restored = parseDemoDraft(JSON.stringify(legacy));
  assert.equal(restored.step, 0);
  assert.equal(restored.unlockedStep, 0);
  assert.equal(restored.config.age, 34);
  assert.equal(restored.config.gender, 'male');
  assert.equal(restored.config.assembly, 'preset');
  assert.equal(restored.config.rememberMoments, true);
  assert.equal(restored.config.takesInitiative, false);
});

test('untrusted age, identity, personality and oversized backgrounds fail safely', () => {
  for (const patch of [{ age: 17 }, { age: 101 }, { name: 'x'.repeat(41) }, { background: 'x'.repeat(1201) }, { personality: { friends: 'invented' } }, { assembly: 'unknown' }]) {
    assert.deepEqual(parseDemoDraft(JSON.stringify({ ...DEFAULT_DRAFT, config: { ...DEFAULT_DRAFT.config, ...patch } })), DEFAULT_DRAFT);
  }
});

test('long multilingual and escaped chat history fits the HTTP body budget without mutating the transcript', async () => {
  const { prepareChatRequest, MAX_CHAT_REQUEST_BYTES } = await import('../src/domain/companion/chat.ts');
  for (const character of ['界', '\\', '\u0000']) {
    const messages = Array.from({ length: 19 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: character.repeat(i % 2 ? 600 : 1700) }));
    const input = { relationship: 'friends', config: DEFAULT_DRAFT.config, messages };
    const request = prepareChatRequest(input);
    assert.ok(new TextEncoder().encode(JSON.stringify(request)).length <= MAX_CHAT_REQUEST_BYTES);
    assert.equal(request.messages[0].role, 'user');
    assert.equal(request.messages.at(-1).content, messages.at(-1).content);
    assert.equal(messages.length, 19);
  }
});

test('capability settings survive save and reload while older drafts receive defaults', () => {
  const older = { ...DEFAULT_DRAFT, config: { ...DEFAULT_DRAFT.config } };
  delete older.config.capabilities;
  const migrated = parseDemoDraft(JSON.stringify(older));
  assert.equal(migrated.config.capabilities.mind.empathy, 65);
  const capabilities = structuredClone(migrated.config.capabilities);
  capabilities.mind.empathy = 90;
  capabilities.knowledge.interests = ['science', 'music'];
  capabilities.presence.voiceSpeed = 70;
  const restored = parseDemoDraft(serializeDemoDraft({ ...migrated, step: 3, unlockedStep: 3, config: { ...migrated.config, capabilities } }));
  assert.equal(restored.config.capabilities.mind.empathy, 90);
  assert.deepEqual(restored.config.capabilities.knowledge.interests, ['science', 'music']);
  assert.equal(restored.config.capabilities.presence.voiceSpeed, 70);
  assert.equal(restored.step, 3);
});

test('corrupt capability settings cannot become a saved character profile', () => {
  for (const change of [cap => { cap.mind.empathy = 101; }, cap => { cap.presence.vision = 'yes'; }, cap => { cap.knowledge.interests = ['science', 'science']; }, cap => { cap.world.autonomy = 'unrestricted'; }, cap => { cap.knowledge.avoidTopics = 'x'.repeat(301); }]) {
    const capabilities = structuredClone(DEFAULT_DRAFT.config.capabilities);
    change(capabilities);
    assert.deepEqual(parseDemoDraft(JSON.stringify({ ...DEFAULT_DRAFT, step: 3, unlockedStep: 3, config: { ...DEFAULT_DRAFT.config, capabilities } })), DEFAULT_DRAFT);
  }
});

test('unreleased v4 drafts reset safely while current five-step progress reloads', () => {
  const old = { ...DEFAULT_DRAFT, version: 4, step: 3, unlockedStep: 3 };
  const migrated = parseDemoDraft(JSON.stringify(old));
  assert.deepEqual(migrated, DEFAULT_DRAFT);
  const complete = parseDemoDraft(serializeDemoDraft({ ...DEFAULT_DRAFT, step: 4, unlockedStep: 4 }));
  assert.equal(complete.step, 4);
  assert.equal(complete.unlockedStep, 4);
});
