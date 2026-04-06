# Drag-and-drop links between sections

## Goal

Move a link from one section to another (and optionally reorder within a section) using drag-and-drop, reusing the project’s `@dnd-kit` investment.

## Architecture fit

- **State:** `sections[].links` arrays updated immutably in `save((prev) => …)` from [`App.tsx`](../../src/App.tsx)—same pattern as [`handleLinkSave`](../../src/App.tsx) but splice/move across two sections.
- **Canvas:** [`SectionFrame`](../../src/components/canvas/SectionFrame.tsx) link area becomes drop target; draggable `LinkCard` or wrapper; coordinate with existing section-level [`useDraggable`](../../src/components/canvas/SectionFrame.tsx) so link drag does not start a section drag (separate sensors or handles).
- **List:** [`SectionRow`](../../src/components/list/SectionRow.tsx) horizontal lists need clear drop zones between sections.

## Constraints

- **Nested dnd-kit:** Section drag vs link drag is a classic conflict; likely need `DragOverlay`, custom collision detection, or drag handle on link only.
- **Scroll containers:** Same lessons as canvas section drag ([`PROJECT.md`](../../PROJECT.md)—transform vs delta in scrollable areas).
- **Edit mode:** Decide if cross-section moves are edit-only (consistent with adding links).

## Open questions

- Reorder-within-section in the same milestone as cross-section?
- Undo / toast on accidental moves?

## Notes / Rejected Ideas

-
