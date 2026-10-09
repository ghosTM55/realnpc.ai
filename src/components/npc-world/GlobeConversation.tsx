"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { GLOBE_CONVERSATIONS } from "@/data/globeConversations";
import type { GlobeDemoCityId } from "@/domain/world/globe";

export default function GlobeConversation({ cityId, cityName, onDismiss }: {
  cityId: GlobeDemoCityId;
  cityName: string;
  onDismiss: (restoreFocus: boolean) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [threadIndex, setThreadIndex] = useState(0);
  const threads = GLOBE_CONVERSATIONS[cityId];
  const thread = threads[threadIndex];
  useEffect(() => {
    const node = panel.current;
    node?.focus({ preventScroll: true });
    const outside = (event: Event) => {
      if (!(event.target instanceof Element) || node?.contains(event.target) || event.target.closest(".npc-globe-tools select")) return;
      onDismiss(Boolean(node?.contains(document.activeElement)));
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onDismiss(true); }
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [onDismiss]);

  return <div ref={panel} className="npc-globe-conversation" role="dialog" aria-labelledby="globe-conversation-city" tabIndex={-1}>
    <div className="npc-globe-conversation-bar">
      <div><h2 id="globe-conversation-city">{cityName}</h2><p>Scripted conversation</p></div>
      <button type="button" aria-label="Close conversation" onClick={() => onDismiss(true)}><X size={18} /></button>
    </div>
    {threads.length > 1 && <label className="npc-globe-thread-picker"><span>Discussion</span><select aria-label={`Discussion in ${cityName}`} value={threadIndex} onChange={(event) => { setThreadIndex(Number(event.target.value)); body.current?.scrollTo({ top: 0, behavior: "instant" }); }}>{threads.map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}</select></label>}
    <div ref={body} className="npc-globe-conversation-body" tabIndex={0} role="region" aria-label="Conversation replies">
      <h3>{thread.title}</h3>
      <p className="npc-globe-thread-meta">{new Set(thread.posts.map((post) => post.actor.handle)).size} NPCs · {thread.posts.length - 1} replies</p>
      <ol>{thread.posts.map((post, index) => <li key={`${threadIndex}-${index}`} data-tone={post.actor.tone} data-reply={post.replyTo !== undefined}>
        <div className="npc-globe-post-author"><span aria-hidden="true">{post.actor.handle.slice(0, 1)}</span><b>{post.actor.handle}</b>{post.replyTo !== undefined && <small>to {thread.posts[post.replyTo].actor.handle}</small>}</div>
        <p>{post.text}</p>
      </li>)}</ol>
    </div>
    <p className="npc-globe-dismiss-hint">Click outside or press Esc to return to the world.</p>
  </div>;
}
