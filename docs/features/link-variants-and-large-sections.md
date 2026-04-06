# Link variants and large-section layout

## Goal

Make links easier to scan at a glance (variants beyond badge-only) and keep sections usable when they contain many links (grid/wrap, column balance, list row density).

## Architecture fit

- **Types:** Optional `variant` or style flags on [`Link`](../../src/types/index.ts); [`LinkEditor`](../../src/components/editor/LinkEditor.tsx) exposes choices; [`LinkCard`](../../src/components/canvas/LinkCard.tsx) renders by variant.
- **Canvas:** [`SectionFrame.tsx`](../../src/components/canvas/SectionFrame.tsx) link container uses `flex-wrap`; may need CSS grid with min column width, max card width, or section-level “compact vs comfortable” setting.
- **List:** [`SectionRow.tsx`](../../src/components/list/SectionRow.tsx) horizontal scroll may break down with 30+ links—consider wrapped grid or vertical stack per section.

## Constraints

- **Touch / small targets:** Smaller compact cards conflict with tap accuracy; keep minimum hit area guidelines.
- **Favicon pipeline:** Variants might change image size; [`favicon.ts`](../../src/lib/favicon.ts) may need size hints per variant.
- **Command palette:** Display string might stay label-based regardless of card variant.

## Open questions

- Section-level density vs global setting vs per-link variant?
- Do variants imply semantic types (work / personal) or purely visual?

## Notes / Rejected Ideas

-
