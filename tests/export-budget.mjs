import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(process.env.REALNPC_EXPORT_DIR ?? "out");
for (const route of ["", "npc-world", "configurator", "partnership"]) {
  const html = await readFile(resolve(root, route, "index.html"), "utf8");
  const fonts = [...new Set([...html.matchAll(/<link\b[^>]*>/g)]
    .filter(([tag]) => /as="font"/.test(tag))
    .map(([tag]) => tag.match(/href="([^"]+)"/)[1]))];
  const bytes = (await Promise.all(fonts.map(async (url) => {
    const file = resolve(root, `.${url}`);
    return url.endsWith(".woff2") ? (await stat(file)).size : gzipSync(await readFile(file)).length;
  }))).reduce((sum, value) => sum + value, 0);
  assert.ok(bytes <= 200_000, `${route || "/"}: preloaded fonts cost ${bytes} bytes (budget 200,000)`);
  console.log(`PASS ${route || "/"}: ${bytes} bytes of preloaded fonts`);
}
