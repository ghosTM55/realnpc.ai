// Optional local verification with an isolated copy of Vercel's official builders.
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (!process.env.REALNPC_VERCEL_BUILDERS) throw new Error('Set REALNPC_VERCEL_BUILDERS to a temporary directory containing @vercel/backends and @vercel/build-utils. See README.md.');
const require = createRequire(join(process.env.REALNPC_VERCEL_BUILDERS, 'package.json'));
const { build } = await import(pathToFileURL(require.resolve('@vercel/backends')).href);
const { glob, streamToBuffer } = await import(pathToFileURL(require.resolve('@vercel/build-utils')).href);
const root = fileURLToPath(new URL('../../', import.meta.url));
const workPath = await realpath(await mkdtemp(join(tmpdir(), 'realnpc-backend-source-')));
for (const path of ['server.ts', 'vercel.json', 'package.json', 'tsconfig.json', 'services/soul-api/server.ts', 'src/domain/companion', 'src/data/configuratorSteps.ts']) {
  await mkdir(dirname(join(workPath, path)), { recursive: true });
  await cp(join(root, path), join(workPath, path), { recursive: true });
}
const config = JSON.parse(await readFile(join(workPath, 'vercel.json'), 'utf8'));
const result = await build({ entrypoint: 'package.json', files: await glob('**', workPath), workPath, repoRootPath: workPath, config: { ...config, projectSettings: config }, meta: { isDev: false } });
const lambda = result.output.index;
assert.equal(lambda.runtime, 'nodejs24.x');
assert.equal(lambda.maxDuration, 60);
assert.equal(lambda.supportsCancellation, true);
const out = await realpath(await mkdtemp(join(tmpdir(), 'realnpc-backend-bundle-')));
for (const [path, file] of Object.entries(lambda.files)) {
  await mkdir(dirname(join(out, path)), { recursive: true });
  await writeFile(join(out, path), await streamToBuffer(file.toStream()));
}
console.log(JSON.stringify({ out, handler: lambda.handler, runtime: lambda.runtime, files: Object.keys(lambda.files) }, null, 2));
