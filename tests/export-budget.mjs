import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(process.env.REALNPC_EXPORT_DIR ?? "out");
const maps = (await readdir(resolve(root, "data"))).filter(name => name.endsWith(".geojson"));
assert.equal(maps.length, 1, "Export only the stripped world map");
assert.match(maps[0], /^countries-110m\.[a-f0-9]{12}\.geojson$/, "Map URL must change when its content changes");
const map = await readFile(resolve(root, "data", maps[0]));
assert.ok(gzipSync(map, { level: 9 }).length <= 100_000, "World map must stay below 100 KB gzip");
console.log(`PASS world map: ${gzipSync(map, { level: 9 }).length} bytes gzip`);

const compressedBytes = async urls => (await Promise.all([...new Set(urls)].map(async url =>
  gzipSync(await readFile(resolve(root, `.${url}`)), { level: 9 }).length,
))).reduce((sum, value) => sum + value, 0);

for (const [route, jsBudget, cssBudget] of [["", 255_000, 12_000], ["npc-world", 225_000, 16_000], ["configurator", 225_000, 11_000], ["partnership", 215_000, 12_000]]) {
  const html = await readFile(resolve(root, route, "index.html"), "utf8");
  const fonts = [...new Set([...html.matchAll(/<link\b[^>]*>/g)]
    .filter(([tag]) => /as="font"/.test(tag))
    .map(([tag]) => tag.match(/href="([^"]+)"/)[1]))];
  const bytes = (await Promise.all(fonts.map(async (url) => {
    const file = resolve(root, `.${url}`);
    return url.endsWith(".woff2") ? (await stat(file)).size : gzipSync(await readFile(file)).length;
  }))).reduce((sum, value) => sum + value, 0);
  assert.ok(bytes <= 200_000, `${route || "/"}: preloaded fonts cost ${bytes} bytes (budget 200,000)`);
  const jsBytes = await compressedBytes([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]));
  assert.ok(jsBytes > 0 && jsBytes <= jsBudget, `${route || "/"}: initial JS costs ${jsBytes} bytes gzip (budget ${jsBudget})`);
  const styles = [...html.matchAll(/<link\b[^>]*>/g)].filter(([tag]) => /rel="stylesheet"/.test(tag)).map(([tag]) => tag.match(/href="([^"]+)"/)[1]);
  const cssBytes = await compressedBytes(styles);
  assert.ok(cssBytes > 0 && cssBytes <= cssBudget, `${route || "/"}: CSS costs ${cssBytes} bytes gzip (budget ${cssBudget})`);
  if (route === "npc-world") {
    assert.ok([...html.matchAll(/<link\b[^>]*>/g)].some(([tag]) => tag.includes(`/data/${maps[0]}`) && /rel="preload"/.test(tag) && /as="fetch"/.test(tag) && /crossorigin="(?:anonymous)?"/i.test(tag)), "World page must preload the same map fetched by the globe");
  }
  console.log(`PASS ${route || "/"}: fonts ${bytes} B; initial JS ${jsBytes} B gzip; CSS ${cssBytes} B gzip`);
}

// Crawler and social metadata: every indexable route gets a canonical URL and
// the shared Open Graph image, and the export ships robots + sitemap.
const socialImage = await readFile(resolve(root, "brand/og.png"));
assert.equal(socialImage.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "Social preview must be a PNG");
assert.equal(socialImage.readUInt32BE(16), 1200, "Social preview width");
assert.equal(socialImage.readUInt32BE(20), 630, "Social preview height");
const canonicalUrls = {
  "": "https://realnpc.ai/",
  "npc-world": "https://realnpc.ai/npc-world/",
  configurator: "https://realnpc.ai/configurator/",
  partnership: "https://realnpc.ai/partnership/",
  "companion-lab": "https://realnpc.ai/configurator/",
};
for (const [route, canonical] of Object.entries(canonicalUrls)) {
  const html = await readFile(resolve(root, route, "index.html"), "utf8");
  assert.deepEqual([...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(match => match[1]), [canonical], `${route || "/"}: canonical must point to the correct route`);
  assert.deepEqual([...html.matchAll(/<meta property="og:url" content="([^"]+)"/g)].map(match => match[1]), [canonical], `${route || "/"}: Open Graph URL must match canonical`);
  assert.match(html, /<meta property="og:image" content="https:\/\/realnpc\.ai\/brand\/og\.png"/, `${route || "/"}: missing Open Graph image`);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/, `${route || "/"}: missing Twitter card`);
}
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort(), [
  "https://realnpc.ai/",
  "https://realnpc.ai/configurator/",
  "https://realnpc.ai/npc-world/",
  "https://realnpc.ai/partnership/",
], "Sitemap must list every canonical route exactly once, excluding the legacy redirect");
const robots = await readFile(resolve(root, "robots.txt"), "utf8");
assert.match(robots, /^Allow: \/$/m, "Crawlers can access the public site");
assert.doesNotMatch(robots, /^Disallow:\s*\S+/m, "Crawlers must be able to discover the legacy redirect and canonical");
assert.match(robots, /^Sitemap: https:\/\/realnpc\.ai\/sitemap\.xml$/m, "robots.txt points at the sitemap");
console.log("PASS SEO: canonical, Open Graph image, sitemap and robots on every route");

const chunks = resolve(root, "_next/static/chunks");
for (const file of await readdir(chunks)) {
  if (!file.endsWith(".js")) continue;
  const bytes = gzipSync(await readFile(resolve(chunks, file)), { level: 9 }).length;
  assert.ok(bytes <= 550_000, `${file}: JS chunk costs ${bytes} bytes gzip (budget 550,000, including deferred globe)`);
}
const media = resolve(root, "_next/static/media");
const scenes = (await readdir(media)).filter(file => /^(hero|assembly)-.*\.webp$/.test(file));
assert.equal(scenes.length, 7, "Export all seven responsive scene variants");
for (const file of scenes) {
  const bytes = (await stat(resolve(media, file))).size;
  const budget = file.startsWith("hero-") ? 160_000 : 230_000;
  assert.ok(bytes <= budget, `${file}: scene image costs ${bytes} bytes (budget ${budget})`);
}
console.log("PASS deferred JS and responsive scene image budgets");
