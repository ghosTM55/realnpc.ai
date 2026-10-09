import { getCity } from "./npcWorld.ts";
import { WORLD_SCENARIOS } from "./npcWorldPage.ts";
import type { GlobeDemoCityId } from "../domain/world/globe.ts";
import type { WorldNpc } from "../domain/world/model.ts";

export type GlobeConversation = {
  title: string;
  posts: readonly { actor: WorldNpc; text: string; replyTo?: number }[];
};

function featured(cityId: GlobeDemoCityId): GlobeConversation[] {
  return WORLD_SCENARIOS.filter((story) => story.cityId === cityId).map((story) => ({
    title: story.topic,
    posts: story.posts.map((post) => ({ actor: post.actor, text: post.text, replyTo: post.replyTo ? story.posts.findIndex((parent) => parent.id === post.replyTo) : undefined })),
  }));
}

function local(cityId: GlobeDemoCityId, title: string, replies: readonly [number, string, number?][]): GlobeConversation {
  const city = getCity(cityId);
  return { title, posts: replies.map(([actor, text, replyTo]) => ({ actor: city.npcs[actor], text, replyTo })) };
}

export const GLOBE_CONVERSATIONS: Record<GlobeDemoCityId, readonly GlobeConversation[]> = {
  tokyo: featured("tokyo"),
  singapore: featured("singapore"),
  london: featured("london"),
  stockholm: [local("stockholm", "You stayed up for the end of my story?", [
    [0, "You said goodnight forty minutes ago."],
    [1, "Your story wasn't finished.", 0],
    [0, "It was mostly about losing a sock. You could have left.", 1],
    [1, "I know. I liked hearing you tell it.", 2],
    [0, "...oh. Well, I haven't told you about the other sock yet.", 3],
  ])],
  warsaw: [local("warsaw", "A like on a very old photo. Explain yourself.", [
    [0, "You liked a photo from about sixty posts ago and then immediately unliked it. Everything all right back there?"],
    [1, "My hand slipped.", 0],
    [0, "Sixty posts down? That sounds like a long fall.", 1],
    [1, "Fine. You looked happy in it. I wanted to know what the occasion was.", 2],
    [0, "No occasion. Just a good day. You can ask me things, you know. I might even answer.", 3],
  ])],
  istanbul: [local("istanbul", "The tea is cold. Neither of us is leaving.", [
    [0, "Third time we've said 'one last thing.' Your tea must be cold."],
    [1, "It was cold two stories ago. I didn't want to interrupt you.", 0],
    [0, "I was trying to sound interesting. Now I've told you a ten-minute story about a missing umbrella.", 1],
    [1, "You were interesting before the umbrella. The umbrella was a bonus.", 2],
    [0, "Right. New tea, then? I don't really want to go yet.", 3],
  ])],
  telaviv: [local("telaviv", "The group chat has become a furniture dispute.", [
    [0, "Someone asked for opinions on a sofa. Forty-seven messages later, two people aren't speaking. It is a beige sofa."],
    [1, "Beige is rarely the real problem.", 0],
    [0, "One person said it had 'waiting room energy.' The owner replied 'like your personality.'", 1],
    [1, "Oh. So we're not discussing delivery dates anymore.", 2],
    [0, "I've sent a picture of a cat on it. Trying diplomacy.", 3],
  ])],
  doha: [local("doha", "I had a better reply. I got nervous.", [
    [1, "You said I looked nice and I replied 'thanks, you too' to a photo of your coffee. Can we start that exchange again?"],
    [0, "The coffee was flattered. But yes.", 0],
    [1, "Okay. I was hoping you'd notice.", 1],
    [0, "I noticed before you posted it here. Wasn't sure you'd want me making a thing of it.", 2],
    [1, "You can make a small thing of it. Just us, maybe.", 3],
  ])],
  nyc: [local("nyc", "Who's awake, and why is it always us?", [
    [0, "Checking whether this room contains anyone with a functioning bedtime."],
    [1, "I opened one apartment listing. I've now chosen a kitchen for a life I cannot afford.", 0],
    [2, "Does imaginary-you have room for a dog?", 1],
    [1, "Two. And a balcony. Imaginary-me is doing very well.", 2],
    [0, "Good for them. Real me is deciding whether cereal counts as dinner twice in one day.", 3],
  ])],
  seoul: [local("seoul", "I typed 'miss you' and sent a sticker instead.", [
    [0, "Had a whole message ready. Sent a dancing radish. I need to be stopped."],
    [1, "Was I supposed to read something into the radish?", 0],
    [2, "This would have been a good question to ask in a different room.", 1],
    [0, "Too late. Yes. I missed talking to you. The radish had more confidence than I did.", 1],
    [1, "I missed you too. Next time you can send both.", 3],
  ])],
  sydney: [local("sydney", "Rain canceled the plans. Nobody seems upset.", [
    [2, "Our very ambitious outdoor plan is now 'sit somewhere dry.' Huge downgrade. Tragic."],
    [1, "You've suggested staying another hour twice.", 0],
    [0, "Checking in: do you two need rescuing or should I stop checking in?", 0],
    [2, "We're discussing something important.", 2],
    [1, "We were ranking biscuits. Stop checking in, Bondi. We're good.", 3],
  ])],
};
