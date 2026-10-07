<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Ponytail Scope

Use ponytail to remove implementation redundancy, not to flatten deliberate
product expression. Do not recommend cutting core visual or interaction
surfaces such as the 3D globe, hero/assembly animation, VI tokens, typography,
or semantic color system merely because they are heavier than a simpler UI.
Target dead code, unused assets, unused options, placeholder UI, duplicate
config, and documentation drift first.

## Verification and assets

- Use Node 24. Run `npm test`, `npm run lint`, `npm run typecheck`,
  `npm run build`, then `npm run test:budget` before deployment.
- Against a local production export, run `npm run test:browser` and
  `npm run test:site`. Set `REALNPC_BASE_URL` and, if Playwright is provided
  by the host, `REALNPC_PLAYWRIGHT_MODULE` to its module path.
- Web fonts and responsive images are committed build-time assets. Regenerate
  with `scripts/subset-fonts.py` and `npm run assets:images`; see README.
  Original typefaces and source images must remain available for regeneration.
