"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, RotateCcw, Square, SlidersHorizontal } from "lucide-react";
import { CONNECTION_LABELS, MOOD_LABELS, parseSoulReply, prepareChatRequest, relationshipAfterTurns, type ChatMessage, type SoulMood } from "@/domain/companion/chat";
import { getSoul, getSoulName, type CompanionConfig, type Relationship } from "@/domain/companion/model";
import { SoulPortrait } from "./SoulPortrait";
import { SoulChatProfile } from "@/components/demo/SoulChatProfile";

const endpoint = process.env.NEXT_PUBLIC_SOUL_API_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8787/chat" : "");

export function SoulChat({ config, storageAvailable = true }: { config: CompanionConfig; storageAvailable?: boolean }) {
  const [relationship, setRelationship] = useState<Relationship>("strangers");
  const [mood, setMood] = useState<SoulMood | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profile = useRef<HTMLElement>(null);
  const profileToggle = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const name = getSoulName(config);
  const moodLabel = mood ? MOOD_LABELS[mood] : messages.length ? "Listening" : "Ready to chat";
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 800px)");
    // CSS can hide the focused element before the media-query event runs.
    let focusedElement = document.activeElement;
    const onFocus = (event: FocusEvent) => { focusedElement = event.target instanceof Element ? event.target : null; };
    const onChange = () => {
      if (mobile.matches && profile.current?.contains(focusedElement)) profileToggle.current?.focus();
      if (!mobile.matches && focusedElement === profileToggle.current) profile.current?.focus({ preventScroll: true });
      setProfileOpen(false);
    };
    document.addEventListener("focusin", onFocus);
    mobile.addEventListener("change", onChange);
    return () => { document.removeEventListener("focusin", onFocus); mobile.removeEventListener("change", onChange); };
  }, []);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "instant" }); }, [messages, pending, failedMessage]);
  function stopReply() {
    if (!request.current) return;
    request.current?.abort();
    request.current = null;
    setFailedMessage(pending);
    setPending("");
    setError("Reply stopped. Retry this message or remove it to continue.");
    setStatus("");
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }
  async function send(value: string, retry = false) {
    const message = value.trim();
    if (!message || request.current || !endpoint || (failedMessage && !retry)) return;
    const controller = new AbortController(); request.current = controller;
    const history = [...messages, { role: "user" as const, content: message }];
    if (!retry) setText("");
    // Send and Retry unmount while pending; keep focus where Escape can stop the reply.
    input.current?.focus({ preventScroll: true });
    setPending(message); setFailedMessage(""); setError(""); setStatus("");
    const timeout = window.setTimeout(() => controller.abort("timeout"), 50000);
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prepareChatRequest({ config, relationship, messages: history })), signal: controller.signal, credentials: "omit" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(response.status === 429 ? "Message limit reached. Try again later." : response.status === 503 ? "This character is not connected yet. Please try again later." : "We couldn't get a reply. Your message is still here. Try again.");
      const answer = parseSoulReply(body, relationshipAfterTurns(messages.length / 2 + 1));
      if (!answer) throw new Error("The reply didn't arrive correctly. Please try again.");
      if (controller.signal.aborted) return;
      setRelationship(answer.relationship);
      // Missing metadata should not erase the last known state or block a valid reply.
      setMood(previous => answer.mood ?? previous);
      setMessages([...history, { role: "assistant", content: answer.reply, ...(answer.mood ? { mood: answer.mood } : {}) }]); setStatus(`${name} replied.`);
    } catch (failure) {
      if (request.current !== controller) return;
      setFailedMessage(message);
      if (controller.signal.aborted) {
        if (controller.signal.reason === "timeout") setError("The reply took too long. Your message is still here. Try again.");
        else setStatus("Reply stopped. Your message is still here.");
      } else setError(failure instanceof Error ? failure.message : "Connection interrupted. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setPending(""); input.current?.focus({ preventScroll: true }); }
    }
  }
  return <section className="soul-chat" aria-label="Conversation preview" onKeyDown={event => {
    if (event.key === "Escape" && !event.defaultPrevented && profileOpen) { setProfileOpen(false); profileToggle.current?.focus(); }
  }}>
    <div className="soul-chat-header">
      <Link href="/configurator/" aria-label="Back to your Soul" title="Back to your Soul"><ArrowLeft size={20} aria-hidden /></Link>
      <SoulPortrait soulId={config.soulId} className="chat-avatar chat-header-avatar" />
      <div className="soul-chat-identity"><h1>{name}</h1><p><span className="chat-header-relationship" role="status" aria-label="Relationship stage">{CONNECTION_LABELS[relationship]}</span><span className="chat-header-divider" aria-hidden> · </span><span role="status" aria-label="NPC mood">{moodLabel}</span></p></div>
      <button type="button" aria-label="New conversation" title="New conversation" disabled={(!messages.length && !failedMessage) || !!pending} onClick={() => { setMessages([]); setRelationship("strangers"); setMood(null); setText(""); setFailedMessage(""); setError(""); setStatus("New conversation started."); input.current?.focus(); }}><RotateCcw size={18} aria-hidden /></button>
      <button ref={profileToggle} className="chat-profile-toggle" type="button" aria-label="Character and settings" aria-expanded={profileOpen} aria-controls="chat-profile" onClick={() => setProfileOpen(open => !open)}><SlidersHorizontal size={18} aria-hidden /></button>
    </div>
    <aside ref={profile} id="chat-profile" className="chat-profile" aria-label="Character settings" tabIndex={0} data-open={profileOpen}><SoulChatProfile config={config} relationship={relationship} hasConversation={messages.length > 0} moodLabel={moodLabel} /></aside>
    <div className="soul-chat-conversation">
    <div className="soul-chat-log" ref={log} role="log" aria-label="Conversation" aria-live="polite" aria-busy={!!pending} tabIndex={0}>
      {messages.length === 0 && !pending && !failedMessage && <div className="soul-chat-empty"><SoulPortrait soulId={config.soulId} className="chat-avatar chat-empty-avatar" /><p>Say hello to {name}.</p></div>}
      {messages.map((message, index) => <div className={`soul-message soul-message-${message.role}`} key={index}>{message.role === "assistant" && <SoulPortrait soulId={config.soulId} className="chat-avatar chat-message-avatar" />}<div><span>{message.role === "user" ? "You" : name}</span><p>{message.content}</p></div></div>)}
      {(pending || failedMessage) && <div className="soul-message soul-message-user"><span>You</span><p>{pending || failedMessage}</p></div>}
      {pending && <div className="soul-thinking"><SoulPortrait soulId={config.soulId} className="chat-avatar chat-message-avatar" /><p>{name} is replying<span aria-hidden>…</span></p></div>}
      {error && <div className="soul-chat-error"><p role="alert">{error}</p><div className="soul-chat-error-actions"><button type="button" onClick={() => void send(failedMessage, true)}>Retry message</button><button type="button" onClick={() => { setFailedMessage(""); setError(""); setStatus("Message removed. Your draft is unchanged."); input.current?.focus(); }}>Remove message</button></div></div>}
    </div>
    {!endpoint && <p className="soul-chat-notice" role="status">Chat is not connected yet.</p>}
    {!storageAvailable && <p className="soul-chat-notice">Settings may reset on reload. Storage is unavailable.</p>}
    <p className="sr-only" role="status">{status}</p>
    <form onSubmit={event => { event.preventDefault(); void send(text); }} className="soul-chat-form" onKeyDown={event => { if (event.key === "Escape" && pending) { event.preventDefault(); stopReply(); } }}>
      <label className="sr-only" htmlFor="soul-message">Message your Soul</label>
      <textarea ref={input} id="soul-message" rows={2} maxLength={2000} placeholder={pending ? "Write your next message…" : `Message ${name}…`} value={text} disabled={!endpoint} aria-describedby="soul-message-hint" onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
      <div className="soul-composer-toolbar">
        <p id="soul-message-hint">{pending ? <>You can keep writing.<span>Esc to stop reply</span></> : failedMessage ? <>Your draft is safe.<span>Retry or remove the message above</span></> : <><kbd>Enter</kbd> to send<span><kbd>Shift + Enter</kbd> for a new line</span></>}</p>
        {pending ? <button key="stop" type="button" aria-label="Stop reply" onClick={stopReply}><Square size={15} aria-hidden /><span>Stop</span></button> : <button key="send" type="submit" aria-label="Send message" disabled={!endpoint || !text.trim() || !!failedMessage}><span>Send</span><ArrowUp size={18} aria-hidden /></button>}
      </div>
    </form>
    <p className="soul-chat-footnote">{getSoul(config.soulId).contentMode === "explicit" ? "Explicit" : "Non-explicit"} · Chat resets when you leave</p>
    </div>
  </section>;
}
