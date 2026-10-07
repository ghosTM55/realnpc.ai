// Generates the 1200x630 social preview image (public/brand/og.png).
//
// Uses a locally installed Chrome/Chromium in headless mode, mirroring the
// browser tooling the site tests already rely on. Run with:
//   node scripts/generate-og.mjs
//
// The output is committed; CI does not need Chrome because the PNG is checked in.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = new URL("../", import.meta.url);
const output = fileURLToPath(new URL("public/brand/og.png", root));

const CHROME_CANDIDATES = process.env.CHROME_PATH ? [process.env.CHROME_PATH] : [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "google-chrome",
  "chromium",
  "chromium-browser",
];

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await run(candidate, ["--version"], { timeout: 5000 });
      return candidate;
    } catch {
      // Probe both absolute paths and PATH commands before selecting a browser.
    }
  }
}

const fontUrl = (name) =>
  pathToFileURL(fileURLToPath(new URL(`src/fonts/${name}`, root))).href;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: "Ioskeley"; src: url("${fontUrl("IoskeleyMono-Regular.woff2")}") format("woff2"); font-weight: 400; }
  @font-face { font-family: "Ioskeley"; src: url("${fontUrl("IoskeleyMono-SemiBold.woff2")}") format("woff2"); font-weight: 600; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: "Ioskeley", ui-monospace, monospace;
    background: #fbfbfc; color: #15181d;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px;
  }
  .top { display: flex; align-items: center; gap: 24px; }
  .dots { display: flex; gap: 12px; }
  .dot { width: 18px; height: 18px; border-radius: 9999px; }
  .brand { font-size: 30px; letter-spacing: 0.24em; color: #555e69; }
  .title { font-size: 76px; line-height: 1.05; font-weight: 600; letter-spacing: -0.01em; }
  .sub { margin-top: 28px; font-size: 30px; color: #555e69; }
  .bottom { display: flex; justify-content: space-between; font-size: 24px; letter-spacing: 0.08em; color: #8792a0; }
</style>
</head>
<body>
  <div class="top">
    <div class="dots">
      <div class="dot" style="background:#d40d3d"></div>
      <div class="dot" style="background:#43a9c9"></div>
      <div class="dot" style="background:#e6a42b"></div>
    </div>
    <div class="brand">REALNPC</div>
  </div>
  <div>
    <div class="title">The first NPC that lives in your world.</div>
    <div class="sub">Vessel &middot; Soul &middot; Powers &mdash; private companion robotics, configured for you.</div>
  </div>
  <div class="bottom"><span>realnpc.ai</span><span>BUILD-TO-ORDER</span></div>
</body>
</html>`;

const chrome = await findChrome();
if (!chrome) {
  console.error("No executable Chrome/Chromium found. Set CHROME_PATH to a browser binary or PATH command.");
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), "realnpc-og-"));
const page = join(dir, "og.html");
await writeFile(page, html);
try {
  await run(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    `--screenshot=${output}`,
    pathToFileURL(page).href,
  ]);
  const { size } = await readFile(output).then((buffer) => ({ size: buffer.length }));
  console.log(`public/brand/og.png: ${size} bytes`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
