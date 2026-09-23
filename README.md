# RealNPC

Private companion robotics, configured for you. Build-to-order platform for
modular robot companions — assembled across **Vessel** (body), **Soul**
(character & memory), and **Powers** (capabilities & service).

## Stack

- **Next.js (App Router) + TypeScript** — marketing site and one no-input
  companion configurator; no backend or model connection required
- **GSAP + @gsap/react** — hotspot focus-zoom, scroll-lit timeline, scan-in
  checklist; all animation respects `prefers-reduced-motion`
- **Tailwind v4** — VI tokens as CSS variables in `src/app/globals.css`

## Design source of truth

The visual spec lives in the Pencil design file and briefs (separate repo dir):

- `~/Hackspace/Project-C/website.pen` — landing page design (Pencil)
- `~/Hackspace/Project-C/PENCIL_DESIGN_BRIEF.md` — VI: colors, type, semantics
- `~/Hackspace/Project-C/VESSEL_SOUL_POWERS_INTERACTION_BRIEF.md` — AssemblyStage
  interaction spec (§13–15: states, GSAP handoff, media-generation prompts)

VI three-color semantic layer (signals only — never large fills):

| Token | Hex | Meaning |
| --- | --- | --- |
| Vessel Red | `#D40D3D` | body / hardware / engineering confirm / primary CTA |
| Soul Blue | `#43A9C9` | persona / memory / privacy boundary |
| Powers Amber | `#E6A42B` | capability packs / service add-ons |

Set `data-tone="vessel|soul|powers"` on a semantic group. The shared selectors in
`globals.css` provide `--tone`, `--tone-tint`, `--tone-ink` (text on light surfaces)
and `--tone-on-dark`. Tailwind components use `text-tone`, `bg-tone-tint` and
`border-tone/40`; avoid rebuilding tone-to-color maps in JavaScript. Border and
glow opacity remain component decisions, including Activation's tone-specific
strengths. NPC World imports its scoped `.npc-*` stylesheet at the route so
unrelated pages do not load its layout and story styles.

## Architecture map

```
src/
  app/
    page.tsx          # landing (current)
    companion-lab/    # compatible redirect to the unified configurator
    configurator/     # six-step Soul-to-plan flow and local draft export
    npc-world/        # social-world stories and on-demand 3D explorer
    partnership/      # partner paths and operating model
  components/         # landing sections (AssemblyStage = hotspot interaction)
  data/               # site copy + assemblyHotspots (data-driven hotspots)
  types/domain.ts     # assembly concepts and hotspot definitions
  lib/gsap.ts         # single GSAP registration point
  lib/companion.ts    # demo state, scripted scenes, effective permissions and review rules
tests/                # domain tests and local browser smoke test
assets/media/         # original images; not copied to the public export
assets/data/          # original world map; all geometry retained during generation
scripts/              # repeatable font, responsive-image and globe-map generation
```

Configurations produce local plan previews. A future private review intake must
require human review before an order; no backend ReviewCase pipeline, checkout,
cart or deposit exists in this demo.

`src/data/configuratorSteps.ts` owns navigation labels, headings and next-button
copy for all six steps. `ConfiguratorExperience` renders the common heading;
`SoulSetupSteps` renders the first three steps' controls. Navigation labels and
eyebrows deliberately use different copy. Step order still matches draft schema
v3; reordering it requires a migration rather than only editing the metadata.

## Dev

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
npm test
npm run typecheck
npm run test:budget # after build; also enforced by deployment CI
```

## Deployment

The site is exported to `out/` for GitHub Pages. The `main` branch deploys through
`.github/workflows/pages.yml` after lint, domain tests and the production build
pass. Configure the Pages source as **GitHub Actions** and the custom domain as
`realnpc.ai` in the repository settings.

All pages use directory URLs with trailing slashes. Query parameters and the
legacy `/companion-lab/` redirect are handled in the browser. Server-only Next.js
features require a different hosting setup.

To preview the production export locally, run `npm run build`, then
`python3 -m http.server 4173 --bind 127.0.0.1 --directory out`.
`next start` does not serve a static export. Run `npm run test:browser` and
`npm run test:site` against the preview using `REALNPC_BASE_URL`. If Playwright
is provided by your environment, set `REALNPC_PLAYWRIGHT_MODULE` to its module
path; otherwise install it in an isolated test environment.

Use Node 24. `/configurator` is one six-step flow, from choosing a Soul to saving
the complete plan. Existing `/companion-lab` links redirect there. No typing is
required; preset choices stay in the current browser session. Previous two-flow
drafts migrate automatically. No conversation is stored or submitted. See
[the implementation and browser-test guide](docs/COMPANION_DEMO_IMPLEMENTATION.md).

## Asset generation and performance

The original IoskeleyMono TTFs remain in `src/fonts/`. Only the three committed
WOFF2 subsets are imported by the app. They retain Latin, punctuation and every
supported character found in the current TypeScript UI/data, including OpenType
features. Regenerate when introducing copy outside this coverage:

```bash
python3 -m venv .venv-assets
.venv-assets/bin/python -m pip install -r scripts/requirements-assets.txt
.venv-assets/bin/python scripts/subset-fonts.py
npm run assets:images
npm run assets:map
```

Image generation uses the Sharp version installed with Next.js. Originals live
in `assets/media/`; generated WebP variants in `src/media/` are imported so Next
emits content-hashed URLs. Portrait Hero crops preserve its centered composition;
the assembly images retain their aspect ratio and hotspot layout. Images are
generated before commit, with no runtime image service or external font host.
The Hero image has high fetch priority; assembly variants load at low
priority so a fast scroll can reveal the scene without waiting for a lazy load.

The global flow field stays idle while the opaque intro covers it. Other flow
surfaces initialize when visible; warm-up is batched, and reduced motion still
gets a complete static frame. The globe renderer and its Three.js dependency
load separately from the readable page; city stories remain usable on failure.

The original globe GeoJSON lives in `assets/data/`. The generated public map
removes unused feature properties without rounding coordinates, simplifying
geometry or duplicating border paths. Its content-hashed URL is generated in
`src/data/worldMap.ts`; the world page preloads that same URL before hydration.
Regenerate and commit both outputs when updating the source map.

Hero entrances run from the first CSS paint; delayed JavaScript cannot hide
already visible copy. Section dividers use scoped CSS and IntersectionObserver,
so the partnership page does not need GSAP. Assembly zooms remain in GSAP and
cancel when the system switches to reduced motion; popovers use CSS media queries.
Header navigation prefetches marketing routes on hover or keyboard focus instead
of loading every route on arrival. The primary configuration CTA still prefetches.

`test:budget` checks the exported map, preloaded fonts, per-route initial JS/CSS,
deferred JS chunks and responsive scene images. `test:site` also delays JavaScript
to catch title flashes and map waterfalls, checks preload reuse, and switches
motion preferences during assembly interactions. These checks target payload and
loading behavior; local timings are not measurements of mainland China latency.
They also cover reduced-motion decorative markers and NPC scene colors after
client navigation. Configurator browser tests preserve the six steps' copy,
locked-step navigation, draft migration and local plan export.

GitHub Pages controls response caching (currently ten minutes). Region-specific
CDN hosting and longer immutable caching remain infrastructure follow-ups;
Next.js `headers()` cannot configure them in a static export.

## Known follow-ups

- FAQ + System Paths sections and `/membership`
- Real model integration and private-review intake are not connected in this demo
