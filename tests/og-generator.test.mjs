import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const run = promisify(execFile);

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "realnpc-og-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await Promise.all(["scripts", "public/brand", "bin"].map(path => mkdir(join(root, path), { recursive: true })));
  await copyFile(new URL("../scripts/generate-og.mjs", import.meta.url), join(root, "scripts/generate-og.mjs"));
  const browser = join(root, "bin", "chromium");
  await writeFile(browser, `#!${process.execPath}
import { writeFileSync } from "node:fs";
if (process.argv.includes("--version")) {
  console.log("Chromium test fixture");
} else {
  const output = process.argv.find(arg => arg.startsWith("--screenshot="));
  writeFileSync(output.slice("--screenshot=".length), "browser fixture output");
}
`);
  await chmod(browser, 0o755);
  return {
    root,
    env: { ...process.env, PATH: join(root, "bin"), CHROME_PATH: "chromium" },
  };
}

test("OG generation honors a CHROME_PATH command available on PATH", async t => {
  const { root, env } = await fixture(t);
  await run(process.execPath, [join(root, "scripts/generate-og.mjs")], { env, timeout: 10_000 });
  assert.equal(await readFile(join(root, "public/brand/og.png"), "utf8"), "browser fixture output");
});

test("OG generation reports an invalid explicit browser instead of silently using another", async t => {
  const { root, env } = await fixture(t);
  await assert.rejects(
    run(process.execPath, [join(root, "scripts/generate-og.mjs")], {
      env: { ...env, CHROME_PATH: join(root, "missing-chrome") }, timeout: 10_000,
    }),
    error => error.code === 1 && /No executable Chrome\/Chromium found/.test(error.stderr),
  );
});

test("OG generation discovers Chromium when google-chrome is absent", { skip: process.platform !== "linux" }, async t => {
  const { root, env } = await fixture(t);
  delete env.CHROME_PATH;
  await run(process.execPath, [join(root, "scripts/generate-og.mjs")], { env, timeout: 10_000 });
  assert.equal(await readFile(join(root, "public/brand/og.png"), "utf8"), "browser fixture output");
});
