# RealNPC

Private companion robotics, configured for you. Build-to-order platform for
modular robot companions — assembled across **Vessel** (body), **Soul**
(character & memory), and **Powers** (capabilities & service).

## Stack

- **Next.js (App Router) + TypeScript** — marketing site now; configurator and
  admin/order-management later without re-platforming
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
    admin/            # reserved: order management (ReviewCase pipeline)
    api/              # reserved: server routes when backend lands
  components/         # landing sections (AssemblyStage = hotspot interaction)
  data/               # site copy + assemblyHotspots (data-driven hotspots)
  types/domain.ts     # AssemblyHotspot now; BuildPathSummary/ReviewCase reserved
  lib/gsap.ts         # single GSAP registration point
```

Product rule baked into the domain model: configurations never become orders
directly — they become a **ReviewCase** that passes private human review first.
No checkout / cart / deposit anywhere.

## Dev

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

## Known follow-ups

- `public/media/vessel-stage.png` is a placeholder render reused from the hero;
  generate the final base-vessel image (prompts in interaction brief §15) and
  recalibrate hotspot x/y in `src/data/assemblyHotspots.ts`
- FAQ + System Paths sections, `/membership` and `/configurator` pages
