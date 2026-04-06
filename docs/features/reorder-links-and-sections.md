# Reorder links and sections

## Goal

Allow users to change order of links within a section and/or order of sections in the UI without deleting and recreating entries—especially in List layout where order is linear and obvious.

## Architecture fit

- **State:** Order is implicit in `Section.links[]` and `AppState.sections[]` array order ([`src/types/index.ts`](../../src/types/index.ts)); `save((prev) => …)` in [`App.tsx`](../../src/App.tsx) is the right place to apply reorder updates immutably.
- **List UI:** [`ListView.tsx`](../../src/components/list/ListView.tsx) / [`SectionRow.tsx`](../../src/components/list/SectionRow.tsx) render in array order; horizontal link rows are natural candidates for horizontal sortable lists.
- **Canvas UI:** Sections are absolutely positioned; “order” might mean z-index, visual list in a sidebar, or export order rather than spatial reorder—clarify before implementing.
- **Prior art in repo:** [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) already uses `@dnd-kit/core` for section dragging; link reorder might add `@dnd-kit/sortable` or a lighter pointer implementation.

## Constraints

- Nested scroll containers (list horizontal rows, canvas scroll area) can complicate dnd-kit hit testing—mirror the canvas `transform` lessons from PROJECT.md where applicable.
- Touch vs mouse: `PointerSensor` with activation distance is already configured on canvas; link tiles are small—risk of accidental drags vs clicks.
- Omnibox and CommandPalette iterate sections/links in storage order; reordering changes suggestion ordering—likely desired but should be consistent everywhere.

## Open questions

- Reorder in both layouts or List-only first?
- Should reorder be edit-mode-only (consistent with other mutations)?
- Per-section link order only, or also global “favorite” links across sections?

## Notes / Rejected Ideas

-
