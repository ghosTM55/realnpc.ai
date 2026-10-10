import { createServer, type ServerResponse } from "node:http";
import { pathToFileURL } from "node:url";
import { isIP } from "node:net";
import { createSoulPrompt, MAX_CHAT_REQUEST_BYTES, parseChatRequest, parseSoulReply, relationshipAfterTurns } from "../../src/domain/companion/chat.ts";

type Environment = Record<string, string | undefined>;

/** Single-process preview service. Limits reset on restart; production needs an edge quota. */
export function createSoulServer(env: Environment, dependencies: { fetch?: typeof fetch; timeoutMs?: number } = {}) {
  const providerFetch = dependencies.fetch ?? fetch;
  const origins = new Set((env.ALLOWED_ORIGINS ?? (env.VERCEL === "1" ? "" : "http://localhost:3000,http://127.0.0.1:3000")).split(",").map(value => value.trim()).filter(Boolean));
  const clients = new Map<string, { count: number; until: number }>();
  let day = Math.floor(Date.now() / 86400000), daily = 0, active = 0;
  const dailyLimit = Math.max(1, Math.min(2000, Number(env.DAILY_REQUEST_LIMIT) || 200));
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Vary", "Origin");
    const reply = (status: number, body: object) => {
      if (!res.destroyed) { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); }
    };
    if (req.url === "/health" && req.method === "GET") { reply(200, { status: "ok" }); return; }
    if (req.url !== "/chat") { reply(404, { error: "Not found." }); return; }
    const origin = req.headers.origin;
    if (!origin || !origins.has(origin)) { reply(403, { error: "This origin is not allowed." }); return; }
    res.setHeader("Access-Control-Allow-Origin", origin);
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }); res.end(); return;
    }
    if (req.method !== "POST") { reply(405, { error: "Use POST." }); return; }
    if (env.CHAT_ENABLED === "false" || (env.VERCEL === "1" && env.CHAT_ENABLED !== "true")) { reply(503, { error: "Conversations are paused. Please try again later." }); return; }
    if (!req.headers["content-type"]?.startsWith("application/json")) { reply(415, { error: "Use application/json." }); return; }
    const now = Date.now();
    if (Math.floor(now / 86400000) !== day) { day = Math.floor(now / 86400000); daily = 0; }
    for (const [key, entry] of clients) if (entry.until <= now) clients.delete(key);
    // Only Vercel's platform-owned header is trusted on Vercel; standalone hosts use the socket.
    const forwarded = req.headers["x-vercel-forwarded-for"];
    const client = env.VERCEL === "1" && typeof forwarded === "string" && isIP(forwarded.trim())
      ? forwarded.trim() : req.socket.remoteAddress ?? "unknown";
    const bucket = clients.get(client) ?? { count: 0, until: now + 60000 };
    if (bucket.count >= 12 || clients.size >= 10000 || daily >= dailyLimit || active >= 4) {
      res.setHeader("Retry-After", daily >= dailyLimit ? "3600" : "60");
      reply(429, { error: "The conversation limit has been reached. Please try again later." }); return;
    }
    bucket.count++; clients.set(client, bucket);
    const controller = new AbortController();
    const stopUpload = () => { if (!req.complete) req.destroy(); };
    controller.signal.addEventListener("abort", stopUpload, { once: true });
    const abort = () => { if (!res.writableEnded) controller.abort(); };
    res.on("close", abort);
    active++;
    const timeout = setTimeout(() => controller.abort(), dependencies.timeoutMs ?? 45000);
    try {
      const text = await readBody(req, res);
      if (text === null) return;
      let body: unknown;
      try { body = JSON.parse(text); } catch { reply(400, { error: "Invalid JSON." }); return; }
      const input = parseChatRequest(body);
      if (!input) { reply(400, { error: "Please check your Soul settings and message." }); return; }
      const nextRelationship = relationshipAfterTurns((input.completedTurns ?? 0) + 1);
      if (controller.signal.aborted) return;
      const isDeepSeek = input.config.soulId === "scout";
      const apiKey = isDeepSeek ? env.DEEPSEEK_API_KEY : env.OPENROUTER_API_KEY;
      if (!apiKey) { reply(503, { error: "This character is not connected yet. Please try again later." }); return; }
      const model = isDeepSeek ? env.DEEPSEEK_MODEL || "deepseek-flash" : env.OPENROUTER_MODEL || "x-ai/grok-4.7";
      if (!isDeepSeek && !model.startsWith("x-ai/grok-")) { reply(503, { error: "Grok is not configured correctly." }); return; }
      // DeepSeek JSON mode can return empty content when earlier replies are plain text.
      // Preserve known moods so history does not teach the model to omit the field.
      const messages = input.messages.map(message => isDeepSeek && message.role === "assistant"
        ? { role: message.role, content: JSON.stringify({ reply: message.content, ...(message.mood ? { mood: message.mood } : {}) }) }
        : { role: message.role, content: message.content });
      // Body reads yield: another request may have spent the remaining allowance.
      if (daily >= dailyLimit) { res.setHeader("Retry-After", "3600"); reply(429, { error: "The conversation limit has been reached. Please try again later." }); return; }
      daily++;
      const upstream = await providerFetch(isDeepSeek ? "https://api.deepseek.com/chat/completions" : "https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "system", content: createSoulPrompt(input.config, nextRelationship) }, ...messages], max_tokens: 800, stream: false, response_format: { type: "json_object" }, ...(isDeepSeek ? { thinking: { type: "disabled" } } : { reasoning: { effort: "low" }, provider: { require_parameters: true } }) }),
      });
      if (!upstream.ok) { await upstream.body?.cancel(); reply(upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? "This provider is busy. Please try again shortly." : "The AI provider could not reply. Please try again later." }); return; }
      const result = await upstream.json();
      const content = result?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim() || content.length > 8000) { reply(502, { error: "The AI provider returned an empty or invalid reply. Please try again." }); return; }
      let decoded: unknown;
      try { decoded = JSON.parse(content); } catch { reply(502, { error: "The reply could not be read. Please try again." }); return; }
      const answer = parseSoulReply(decoded, nextRelationship);
      if (!answer) { reply(502, { error: "The reply could not be read. Please try again." }); return; }
      reply(200, answer);
    } catch {
      reply(controller.signal.aborted ? 504 : 502, { error: controller.signal.aborted ? "The reply took too long. Please try again." : "Could not reach the AI provider. Please try again." });
    } finally {
      active--; clearTimeout(timeout); res.off("close", abort); controller.signal.removeEventListener("abort", stopUpload);
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

async function readBody(req: AsyncIterable<Buffer>, res: ServerResponse): Promise<string | null> {
  const chunks: Buffer[] = []; let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_CHAT_REQUEST_BYTES) { res.writeHead(413, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "Message history is too large. Start a new conversation." })); return null; }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 8787);
  const server = createSoulServer(process.env);
  server.listen(port, process.env.HOST ?? "127.0.0.1", () => console.log(`Soul API listening on port ${port}`));
}
