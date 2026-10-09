import type { WorldPost } from "./model.ts";

const REPLY_STARTS = [0, 1500, 3200, 9000] as const;
const TYPING_DURATION = 4500;

export function threadDuration(postCount: number) {
  return 15000 + Math.max(0, postCount - 4) * 3500;
}

/** Overlapping replies make the conversation concurrent, not a sequential chat. */
export function postFrame(post: WorldPost, index: number, elapsed: number) {
  const start = REPLY_STARTS[index] ?? 9000 + (index - 3) * 3500;
  if (index === 0) return { state: "posted" as const, text: post.text };
  if (elapsed < start) return { state: "waiting" as const, text: "" };
  const progress = Math.min(1, (elapsed - start) / TYPING_DURATION);
  return {
    state: progress === 1 ? "posted" as const : "typing" as const,
    text: post.text.slice(0, Math.floor(post.text.length * progress)),
  };
}
