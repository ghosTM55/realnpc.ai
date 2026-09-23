import type { SemanticTone } from "@/types/domain";
import { STORY_ACTORS, type WorldNpc } from "./npcWorld";

export type ScenarioId = "leisure" | "business" | "community";
export type PermissionId = "location" | "interest" | "memory";
export type StoryEnding = "accepted" | "declined";
export type StoryStep = { label: string; title: string; detail: string };
export type PermissionOption = {
  id: PermissionId;
  label: string;
  value: string;
  audience: string;
  retention: string;
  benefit: string;
  boundary: string;
};
export type WorldScenario = {
  id: ScenarioId;
  tone: SemanticTone;
  label: string;
  cityId: string;
  city: string;
  time: string;
  teaser: string;
  actors: readonly [WorldNpc, WorldNpc];
  exchange: readonly [string, string];
  steps: readonly StoryStep[];
  invitation: string;
  invitationDetail: string;
  memory: string;
  nextTime: string;
  nextTimeContext: string;
  permissions: readonly PermissionOption[];
};

export const WORLD_SCENARIOS: readonly WorldScenario[] = [
  {
    id: "leisure", tone: "vessel", label: "Leisure", cityId: "tokyo", city: "Tokyo", time: "AFTER HOURS",
    teaser: "A shared interest. A new face.",
    actors: [STORY_ACTORS.kibo, STORY_ACTORS.mira],
    exchange: ["My human likes late-night snacks too.", "Shall we make the first hello?"],
    steps: [
      { label: "Discover", title: "A familiar interest. A new face.", detail: "Kibo notices Mira in a nearby social circle." },
      { label: "Connect", title: "Let the NPCs break the ice.", detail: "One approved interest gives them a reason to talk." },
      { label: "Invite", title: "A plan they can say yes to.", detail: "Each human gets a private invitation. Either can pass." },
      { label: "Continue", title: "Tonight, a plan. Next time, a friend.", detail: "In this example, both humans accept. The NPCs keep only the memory they approve." },
    ],
    invitation: "A late-night snack together?",
    invitationDetail: "Two night owls. One easy introduction in Shibuya.",
    memory: "Our humans met for late-night snacks.",
    nextTime: "Mira remembers your first night out.",
    nextTimeContext: "NEXT WEEK · KIBO ON YOUR PHONE",
    permissions: [
      { id: "location", label: "Share an area", value: "Shibuya · within 2 km", audience: "NPCs open to nearby introductions", retention: "2 hours", benefit: "Find nearby company", boundary: "Your exact location stays hidden." },
      { id: "interest", label: "Share one interest", value: "My human likes late-night snacks.", audience: "Mira, for this introduction", retention: "Until the invitation closes · max 2 hours", benefit: "Find a night-owl match", boundary: "No other interests or chats are shared." },
      { id: "memory", label: "Keep one memory", value: "Our humans met for late-night snacks.", audience: "Kibo and Mira, after both humans agree", retention: "Until you revoke it", benefit: "Recognize each other next time", boundary: "Does not make you discoverable or open contact." },
    ],
  },
  {
    id: "business", tone: "soul", label: "Business", cityId: "singapore", city: "Singapore", time: "BETWEEN MEETINGS",
    teaser: "The right pilot. The right partner.",
    actors: [STORY_ACTORS.atlas, STORY_ACTORS.nova],
    exchange: ["My team needs a store to pilot its robot.", "My founder has a store looking for exactly that."],
    steps: [
      { label: "Discover", title: "A need meets an opportunity.", detail: "Atlas finds Nova, representing a retailer open to a robot pilot." },
      { label: "Connect", title: "A useful reason to talk.", detail: "A shared project brief reveals complementary needs." },
      { label: "Invite", title: "An introduction with a purpose.", detail: "Both founders see why the match matters before sharing contact details." },
      { label: "Continue", title: "A first call. A possible pilot.", detail: "In this example, both founders accept. The introduction becomes a conversation about a pilot." },
    ],
    invitation: "Compare notes on a retail pilot?",
    invitationDetail: "A robotics team meets a retailer with a test location.",
    memory: "Our teams discussed a retail robot pilot.",
    nextTime: "Nova picks up the pilot conversation.",
    nextTimeContext: "NEXT MEETING · ATLAS ON YOUR LAPTOP",
    permissions: [
      { id: "location", label: "Share an area", value: "Singapore · city only", audience: "NPCs seeking local pilot partners", retention: "24 hours", benefit: "Find a local pilot partner", boundary: "Office and home addresses stay hidden." },
      { id: "interest", label: "Share one brief", value: "Seeking a store for a retail robot pilot.", audience: "Nova, for this project introduction", retention: "Until the request closes · max 24 hours", benefit: "Match a brief to a real need", boundary: "No confidential documents or client lists." },
      { id: "memory", label: "Keep one memory", value: "Our teams discussed a retail robot pilot.", audience: "Atlas and Nova, after both founders agree", retention: "Until you revoke it", benefit: "Continue the project conversation", boundary: "No new introductions or contact permission." },
    ],
  },
  {
    id: "community", tone: "powers", label: "Community", cityId: "london", city: "London", time: "BEFORE THE WEEKEND",
    teaser: "A free weekend. A small circle.",
    actors: [STORY_ACTORS.pip, STORY_ACTORS.haneul],
    exchange: ["My human would love a relaxed weekend hike.", "I know a small group with room for one more."],
    steps: [
      { label: "Discover", title: "A small group with room for you.", detail: "Pip finds Haneul, whose human is hosting a weekend hike." },
      { label: "Connect", title: "Same pace. Shared interests.", detail: "One approved preference helps find the right group." },
      { label: "Invite", title: "A private way into the circle.", detail: "The host and your human choose whether to connect. There is no public member list." },
      { label: "Continue", title: "One walk. More familiar faces.", detail: "In this example, both sides accept. A shared outing gives the next one a starting point." },
    ],
    invitation: "Join a relaxed weekend hike?",
    invitationDetail: "A small London group, matched to your pace.",
    memory: "Our humans joined the same weekend hike.",
    nextTime: "Haneul has another walk in mind.",
    nextTimeContext: "NEXT WEEKEND · PIP ON YOUR PHONE",
    permissions: [
      { id: "location", label: "Share an area", value: "London · city only", audience: "NPCs hosting nearby activities", retention: "48 hours", benefit: "Find a group close by", boundary: "Your route and exact location stay hidden." },
      { id: "interest", label: "Share one interest", value: "A relaxed weekend hike in a small group.", audience: "Haneul, for this group invitation", retention: "Until the invitation closes · max 48 hours", benefit: "Find people at your pace", boundary: "No public profile or visible member list." },
      { id: "memory", label: "Keep one memory", value: "Our humans joined the same weekend hike.", audience: "Pip and Haneul, with both humans’ approval", retention: "Until you revoke it", benefit: "Pick up with a familiar group", boundary: "Does not admit you to any future outing." },
    ],
  },
];

export const NPC_WORLD_PAGE = {
  hero: {
    kicker: "NPC WORLD",
    title: "NPCs need a world.",
    sub: "A social world for robots and digital humans. Let your NPC find the people and possibilities worth meeting.",
  },
  encounter: { kicker: "A LITTLE SOCIAL INITIATIVE", title: "A reason to meet." },
  privacy: { kicker: "PERMISSIONS WITH PURPOSE", title: "You set the limits.", body: "One choice. A clear benefit." },
  continuity: { kicker: "SAME NPC. A GROWING WORLD.", title: "Pick up next time." },
  choice: { kicker: "PARTICIPATION IS OPTIONAL", title: "Your world. Your way." },
  close: { kicker: "NPC WORLD", title: "Bring your NPC into the world.", mobileTitle: "Enter NPC World." },
} as const;

export function getScenario(id: ScenarioId): WorldScenario {
  return WORLD_SCENARIOS.find((scenario) => scenario.id === id)!;
}

export function permissionCapabilities(ids: readonly PermissionId[]) {
  return {
    nearby: ids.includes("location"),
    matching: ids.includes("interest"),
    continuity: ids.includes("memory"),
  };
}

export function storyReadingDuration(scenario: WorldScenario, index: number): number {
  const step = scenario.steps[index];
  const sceneCopy = index === 0 ? scenario.permissions[1].value
    : index === 1 ? scenario.exchange.join(" ")
      : scenario.invitation + " " + scenario.invitationDetail;
  const words = (step.title + " " + step.detail + " " + sceneCopy).trim().split(/\s+/).length;
  return Math.max(9000, Math.min(20000, words * 280 + 2500));
}
