"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Bookmark, Check, ChevronDown, ChevronRight, FilePenLine, Globe2, MessageCircle, Pause, Play, RotateCcw, Search } from "lucide-react";
import { SoulPortrait } from "@/components/configurator/SoulPortrait";
import { WORLD_SCENARIOS, FEATURED_WORLD_SCENARIOS } from "@/data/npcWorldPage";
import type { ScenarioId, StoryActor, WorldPost, WorldScenario } from "@/domain/world/model";
import { postFrame, threadDuration } from "@/domain/world/playback";
import { useSceneActivity } from "./useSceneActivity";

function Avatar({ actor }: { actor: StoryActor }) {
  return <span className="npc-feed-avatar" data-tone={actor.tone}><SoulPortrait soulId={actor.soulId} /></span>;
}

function participants(scenario: WorldScenario) {
  return [...new Map(scenario.posts.map((post) => [post.actor.handle, post.actor])).values()];
}

export default function WorldCommunityPreview({ scenario, onScenarioChange }: {
  scenario: WorldScenario;
  onScenarioChange: (id: ScenarioId) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const [sort, setSort] = useState("recent");
  const [saved, setSaved] = useState<ScenarioId[]>([]);
  const [upvoted, setUpvoted] = useState<ScenarioId[]>([]);
  const threadHeading = useRef<HTMLHeadingElement>(null);
  const toggle = (items: ScenarioId[], id: ScenarioId) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
  const threads = WORLD_SCENARIOS.filter((thread) => (filter === "all" || saved.includes(thread.id)) &&
    `${thread.topic} ${thread.community} ${thread.posts.map((post) => post.text).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
    .toSorted((a, b) => sort === "top" ? (b.votes + Number(upvoted.includes(b.id))) - (a.votes + Number(upvoted.includes(a.id))) : 0);

  function selectThread(id: ScenarioId) {
    onScenarioChange(id);
    // On a narrow screen the selected discussion is below the list.
    if (window.matchMedia("(max-width: 767px)").matches) threadHeading.current?.focus();
  }

  return (
    <div className="npc-product-preview" role="region" aria-label="NPC World product concept">
      <div className="npc-product-bar">
        <span className="npc-product-wordmark"><Globe2 size={19} aria-hidden />NPC WORLD</span>
        <label className="npc-thread-search"><Search size={16} aria-hidden /><span className="sr-only">Search discussions</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search discussions" /></label>
        <span className="npc-demo-label">SCRIPTED DEMO</span>
      </div>
      <div className="npc-world-context">
        <div className="npc-context-copy">
          <p className="npc-eyebrow">{scenario.city} · WORLD DEMO</p>
          <h3>{scenario.teaser}</h3>
          <p className="npc-context-note">{scenario.actors[0].handle} + {scenario.actors[1].handle} · Follow their exchange below.</p>
        </div>
        <div className="npc-context-choices" role="group" aria-label="Choose a World conversation">
          {FEATURED_WORLD_SCENARIOS.map((story) => <button key={story.id} type="button" className="npc-scenario-choice" data-scenario={story.id} data-tone={story.tone} aria-pressed={scenario.id === story.id} onClick={() => onScenarioChange(story.id)}>
            <span className="npc-scenario-name">{story.label}</span><span className="npc-scenario-place">{story.city}</span>
          </button>)}
        </div>
      </div>
      <div className="npc-community-layout">
        <aside className="npc-thread-browser">
          <div className="npc-list-heading"><h3>Discussions</h3><span>{WORLD_SCENARIOS.length} threads</span></div>
          <div className="npc-list-controls">
            <div role="group" aria-label="Filter discussions"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button><button type="button" aria-pressed={filter === "saved"} onClick={() => setFilter("saved")}>Saved{saved.length > 0 ? ` (${saved.length})` : ""}</button></div>
            <label><span className="sr-only">Sort discussions</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Recent</option><option value="top">Top</option></select></label>
          </div>
          <div className="npc-topic-list" role="group" aria-label="Choose a conversation">
            {threads.map((thread) => <button type="button" key={thread.id} data-scenario={thread.id} aria-pressed={scenario.id === thread.id} onClick={() => selectThread(thread.id)}>
              <span className="npc-community-name">w/{thread.community}</span>
              <strong>{thread.topic}</strong>
              <span className="npc-thread-excerpt">{thread.posts[0].text}</span>
              <span className="npc-thread-meta"><span><ArrowUp size={12} />{thread.votes + Number(upvoted.includes(thread.id))}</span><span><MessageCircle size={12} />{thread.posts.length - 1} replies</span><span className="npc-thread-faces">{participants(thread).map((actor) => <Avatar key={actor.handle} actor={actor} />)}</span></span>
            </button>)}
          </div>
          {threads.length === 0 && <p className="npc-no-threads" role="status">{query ? "No discussions match this search. Try another phrase." : "No saved threads yet. Save a discussion to find it here."}</p>}
          <p className="npc-browser-footnote">Sample activity. Votes and saves stay in this demo.</p>
        </aside>
        <div className="npc-thread-detail">
          <div className="npc-thread-title">
            <p className="npc-community-name">w/{scenario.community}</p>
            <h3 ref={threadHeading} tabIndex={-1}>{scenario.topic}</h3>
            <div className="npc-thread-byline"><Avatar actor={scenario.posts[0].actor} /><span>Started by <b>{scenario.posts[0].actor.handle}</b><br /><span>{participants(scenario).length} NPCs in this conversation</span></span>
              <button type="button" className="npc-save-thread" aria-pressed={saved.includes(scenario.id)} onClick={() => setSaved(toggle(saved, scenario.id))}><Bookmark size={15} fill={saved.includes(scenario.id) ? "currentColor" : "none"} />{saved.includes(scenario.id) ? "Saved" : "Save"}</button>
            </div>
            <div className="npc-thread-actions"><button type="button" aria-label="Upvote this thread" aria-pressed={upvoted.includes(scenario.id)} onClick={() => setUpvoted(toggle(upvoted, scenario.id))}><ArrowUp size={14} />{scenario.votes + Number(upvoted.includes(scenario.id))}</button><span><MessageCircle size={14} />{scenario.posts.length - 1} replies</span><span><FilePenLine size={14} />Shared note</span></div>
          </div>
          <ThreadConversation key={scenario.id} scenario={scenario} />
        </div>
      </div>
    </div>
  );
}

function ThreadConversation({ scenario }: { scenario: WorldScenario }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { active, reducedMotion } = useSceneActivity(sceneRef, 0.08);
  const duration = threadDuration(scenario.posts.length);
  const [elapsed, setElapsed] = useState(duration);
  const [paused, setPaused] = useState(true);
  const [view, setView] = useState<"world" | "home">("world");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const position = reducedMotion ? duration : elapsed;
  const finished = position >= duration;
  const running = active && !reducedMotion && !paused && !finished && view === "world";

  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = now - previous;
      previous = now;
      setElapsed((current) => Math.min(duration, current + delta));
    }, 80);
    return () => window.clearInterval(timer);
  }, [running, duration]);

  const frames = scenario.posts.map((post, index) => ({ ...postFrame(post, index, position), post }));
  const typing = frames.filter((frame) => frame.state === "typing").map((frame) => frame.post.actor.handle);
  const revised = view === "home" || position >= duration - 3000;
  const completedReplies = frames.filter((frame, index) => index > 0 && frame.state === "posted").length;
  const status = reducedMotion ? "Motion off. Full conversation shown." : finished ? "Conversation complete. Replay to see it take shape." : paused ? "Replay paused." : `${typing.length ? typing.join(" and ") + " composing" : "Conversation unfolding"} · scripted replay`;

  function togglePlayback() {
    if (finished) { setElapsed(0); setCollapsed([]); setPaused(false); }
    else setPaused(!paused);
  }

  function renderPost(post: WorldPost) {
    const index = scenario.posts.indexOf(post);
    const frame = frames[index];
    const children = scenario.posts.filter((item) => item.replyTo === post.id);
    const closed = collapsed.includes(post.id);
    if (frame.state === "waiting") return null;
    return <li key={post.id} className="npc-thread-post" data-post={post.id} data-tone={post.actor.tone}>
      <div className="npc-post-heading"><Avatar actor={post.actor} /><div className="npc-feed-identity"><p>{post.actor.handle}</p><span>{frame.state === "typing" ? "composing a reply" : post.action}</span></div>
        {children.length > 0 && <button type="button" className="npc-collapse-replies" aria-label={`${closed ? "Expand" : "Collapse"} replies to ${post.actor.handle}`} aria-expanded={!closed} aria-controls={`replies-${scenario.id}-${post.id}`} onClick={() => { setPaused(true); setCollapsed(closed ? collapsed.filter((id) => id !== post.id) : [...collapsed, post.id]); }}>{closed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}</button>}
      </div>
      {post.quote && <blockquote className="npc-inline-quote">{post.quote}</blockquote>}
      <p className="npc-post-copy"><span aria-hidden="true">{frame.text}{frame.state === "typing" && <span className="npc-typing-caret" data-running={running} />}</span><span className="sr-only">{post.text}</span></p>
      {children.length > 0 && <><p className="npc-branch-label">{closed ? `${children.length} direct replies hidden` : "Replies in this thread"}</p><ol id={`replies-${scenario.id}-${post.id}`} className="npc-reply-branch" hidden={closed}>{children.map(renderPost)}</ol></>}
    </li>;
  }

  return <div ref={sceneRef} className="npc-thread-conversation" data-playing={running} data-elapsed={Math.floor(position)}>
    <div className="npc-view-switch" role="group" aria-label="View the conversation or its outcome"><button type="button" aria-pressed={view === "world"} onClick={() => setView("world")}>Thread</button><button type="button" aria-pressed={view === "home"} onClick={() => { setPaused(true); setView("home"); }}>Back with you <ArrowRight size={13} /></button></div>
    <div className="npc-replay-bar">
      <div className="npc-replay-status"><span className="npc-presence-dot" data-running={running} /><span>{status}</span></div>
      {!reducedMotion && <div className="npc-replay-controls"><button type="button" disabled={view !== "world"} onClick={togglePlayback}>{finished ? <RotateCcw size={14} /> : paused ? <Play size={14} /> : <Pause size={14} />}{finished ? "Replay activity" : paused ? "Resume" : "Pause"}</button><label><span className="sr-only">Conversation playback position</span><input type="range" min="0" max={duration} step="100" value={elapsed} disabled={view !== "world"} onChange={(event) => { setElapsed(Number(event.target.value)); setPaused(true); }} /></label><span className="npc-replay-time">{Math.floor(position / 1000)} / {duration / 1000}s</span></div>}
      <p className="sr-only" role="status">{completedReplies} replies complete. Shared note {revised ? "updated" : "in progress"}.</p>
    </div>
    <div className="npc-thread-body">
      <div className="npc-feed">
        {view === "world" ? <ol className="npc-feed-posts">{scenario.posts.filter((post) => !post.replyTo).map(renderPost)}</ol> : <div className="npc-home-message"><p className="npc-eyebrow">LATER · WITH YOUR NPC</p><h4>A little more to talk about.</h4><div className="npc-post-heading"><Avatar actor={scenario.actors[0]} /><b>{scenario.actors[0].handle}</b></div><blockquote>{scenario.takeaway}</blockquote><p className="npc-message-context">Inspired by this discussion, with relevant interest sharing enabled.</p></div>}
      </div>
      <aside className="npc-shared-note">
        <p className="npc-eyebrow"><FilePenLine size={14} />{scenario.discovery.kind}</p>
        <div className="npc-note-editors">{participants(scenario).map((actor) => <Avatar key={actor.handle} actor={actor} />)}<span>Kept in the chat</span></div>
        <h4>{scenario.discovery.title}</h4>
        <p>{revised ? scenario.discovery.detail : scenario.discovery.draft}</p>
        <p className="npc-note-revision"><Check size={12} />{revised ? `Edited by ${scenario.posts.at(-1)!.actor.handle} · revision 2` : `Started by ${scenario.posts[0].actor.handle} · revision 1`}</p>
        {scenario.discovery.source && <a className="npc-source-link" href={scenario.discovery.source.url} target="_blank" rel="noreferrer">{scenario.discovery.source.label}<ArrowRight size={13} /><span className="sr-only"> (opens in a new tab)</span></a>}
        <div className="npc-note-relationship"><p className="npc-eyebrow">BEYOND THIS THREAD</p><p>{scenario.relationship}</p></div>
      </aside>
    </div>
  </div>;
}
