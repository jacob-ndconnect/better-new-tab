# Free-floating links (outside sections)

## Goal

On **canvas**, let individual links exist on their own—each with its own `{ x, y }`—so they can be placed and moved anywhere on the board, like loose items on a corkboard. There is **no** dedicated strip, rail, or inbox region for these; they are first-class canvas elements next to sections.

In **list** view, the same links appear grouped in a synthetic section (e.g. **Ungrouped**) so the list stays scannable without inventing a second layout paradigm.

## UX

- **Edit mode:** An **Add link** control sits beside the existing **Edit / Save** control in the top-left toolbar ([`EditModeToolbar.tsx`](../../src/components/editor/EditModeToolbar.tsx)—same cluster as the `FloppyDiskIcon` / `PencilIcon` button). It opens the existing [`LinkEditor`](../../src/components/editor/LinkEditor.tsx) flow, but saves into the free-floating store instead of a `Section`.
- **Canvas:** After save, the new link renders on the canvas and can be dragged independently (same dnd-kit + `transform` lessons as [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) / [`SectionFrame.tsx`](../../src/components/canvas/SectionFrame.tsx)).
- **List:** [`ListView`](../../src/components/list/ListView.tsx) / [`SectionRow`](../../src/components/list/SectionRow.tsx) prepend or append a row titled **Ungrouped** (or a configurable label) that lists those links in a normal horizontal row—no special “strip” UI.

## Architecture fit

- **Model:** Today every link lives in `Section.links[]` ([`src/types/index.ts`](../../src/types/index.ts)). Add something like `AppState.standaloneLinks: Array<{ link: Link; position: { x: number; y: number } }>` (name TBD), with migration in [`useStorage.ts`](../../src/hooks/useStorage.ts). List view derives the Ungrouped `SectionRow` from this array (positions ignored in list).
- **Canvas:** [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) renders `SectionFrame`s **and** a sibling layer of draggable link tiles (new small component, e.g. `FloatingLinkCard`), each with absolute `position` like sections. Reuse or mirror `normalizePosition` / bounds rules where sensible.
- **App / editor:** [`App.tsx`](../../src/App.tsx) today tracks `sectionIdForLink` for [`LinkEditor`](../../src/components/editor/LinkEditor.tsx); add a parallel path (e.g. `standaloneLinkEditId` or a sentinel) so save/delete updates `standaloneLinks` instead of `sections[].links`.
- **Search:** [`CommandPalette.tsx`](../../src/components/search/CommandPalette.tsx) and [`background.ts`](../../src/background.ts) should include standalone links under an “Ungrouped” (or shared label) group for omnibox/palette parity.

## Constraints

- **dnd-kit:** Section drag vs standalone link drag must not conflict (activation distance, handles, or separate `DndContext` strategy—same class of problem as future link-between-sections drag).
- **Storage:** More entities in `chrome.storage.sync` increases quota pressure (see [`data-portability-storage.md`](./data-portability-storage.md)).
- **Z-order:** Overlapping links and sections may need explicit stacking (drag brings to front).

## Open questions

- Exact copy for the synthetic list section (“Ungrouped” vs “On canvas only” vs user-renamable later)?
- Default spawn position for a new standalone link (viewport center, offset from last, or near toolbar)?

## Notes / Rejected Ideas

- **Rejected:** A horizontal or fixed “strip” / dock for standalone links on canvas—the product direction is free placement anywhere on the canvas, not a separate chrome region.
