# Visual refresh: corkboard, minimalist mode, motion

## Goal

Push the product aesthetic toward a corkboard / pin-board feel (texture, depth, playful metaphors), offer an optional minimalist mode for density-first users, and add purposeful animation (not noise).

## Architecture fit

- **Global styles:** [`src/index.css`](../../src/index.css) and Tailwind theme tokens; optional data-attribute on `document` or root (e.g. `data-density="minimal"`) toggled from [`Settings`](../../src/types/index.ts) + [`SettingsModal`](../../src/components/settings/SettingsModal.tsx).
- **Canvas:** [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) `canvas-grid` class and section chrome in [`SectionFrame.tsx`](../../src/components/canvas/SectionFrame.tsx); corkboard cues live here and on [`LinkCard.tsx`](../../src/components/canvas/LinkCard.tsx).
- **Motion:** Prefer CSS `transition` / `@media (prefers-reduced-motion)`; heavier animation only with reduced-motion fallbacks.

## Constraints

- **Extension performance:** New tab should stay fast; avoid large image assets without lazy loading; respect `prefers-reduced-motion`.
- **Theme integration:** Corkboard look must remain readable in dark mode ([`theme-provider.tsx`](../../src/components/theme-provider.tsx)).
- **dnd-kit:** Transforms already drive section drag; extra transforms on the same nodes need care to avoid jank.

## Open questions

- One “style preset” enum in settings vs separate toggles (corkboard on/off, minimal on/off)?
- Shared aesthetic with List layout or canvas-only at first?

## Notes / Rejected Ideas

-
