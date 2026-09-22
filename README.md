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
| Powers Amber | `#D69A2D` | capability packs / service add-ons |

## Architecture map

```
src/
  app/
    page.tsx          # landing (current)
    companion-lab/    # compatible redirect to the unified configurator
    configurator/     # six-step Soul-to-plan flow and local draft export
    admin/            # reserved: order management (ReviewCase pipeline)
    api/              # reserved: server routes when backend lands
  components/         # landing sections (AssemblyStage = hotspot interaction)
  data/               # site copy + assemblyHotspots (data-driven hotspots)
  types/domain.ts     # AssemblyHotspot now; BuildPathSummary/ReviewCase reserved
  lib/gsap.ts         # single GSAP registration point
  lib/companion.ts    # demo state, scripted scenes, effective permissions and review rules
tests/                # domain tests and local browser smoke test
```

Product rule baked into the domain model: configurations never become orders
directly — they become a **ReviewCase** that passes private human review first.
No checkout / cart / deposit anywhere.

## Dev

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
npm test
npm run typecheck
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
`next start` does not serve a static export.

Use Node 24. `/configurator` is one six-step flow, from choosing a Soul to saving
the complete plan. Existing `/companion-lab` links redirect there. No typing is
required; preset choices stay in the current browser session. Previous two-flow
drafts migrate automatically. No conversation is stored or submitted. See
[the implementation and browser-test guide](docs/COMPANION_DEMO_IMPLEMENTATION.md).

## Known follow-ups

- `public/media/vessel-stage.png` is a placeholder render reused from the hero;
  generate the final base-vessel image (prompts in interaction brief §15) and
  recalibrate hotspot x/y in `src/data/assemblyHotspots.ts`
- FAQ + System Paths sections and `/membership`
- Real model integration and private-review intake are not connected in this demo
