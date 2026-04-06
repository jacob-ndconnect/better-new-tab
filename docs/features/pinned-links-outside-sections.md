# Free-floating links (outside sections)

**Status:** Done (implemented).

## Goal

On **canvas**, let individual links exist on their own—each with its own `{ x, y }`—so they can be placed and moved anywhere on the board, like loose items on a corkboard. There is **no** dedicated strip, rail, or inbox region for these; they are first-class canvas elements next to sections.

In **list** view, the same links appear grouped in a synthetic section (e.g. **Ungrouped**) so the list stays scannable without inventing a second layout paradigm.

## UX

- **Edit mode:** An **Add link** control sits next to **Add section** in the bottom edit toolbar ([`EditModeToolbar.tsx`](../../src/components/editor/EditModeToolbar.tsx)). It opens the existing [`LinkEditor`](../../src/components/editor/LinkEditor.tsx) flow and saves into `standaloneLinks` instead of a `Section`.
- **Canvas:** New links render via [`FloatingLinkCard`](../../src/components/canvas/FloatingLinkCard.tsx) and can be dragged independently (same dnd-kit + `transform` pattern as [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) / [`SectionFrame.tsx`](../../src/components/canvas/SectionFrame.tsx)).
- **List:** [`ListView`](../../src/components/list/ListView.tsx) prepends a synthetic **Ungrouped** row ([`SectionRow`](../../src/components/list/SectionRow.tsx)) for those links; positions are ignored in list.

## Architecture fit (as implemented)

- **Model:** Section links remain in `Section.links[]`; additional links live in `AppState.standaloneLinks` as `StandaloneLinkEntry` (`link` + `position`), with migration in [`useStorage.ts`](../../src/hooks/useStorage.ts).
- **Canvas:** [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) renders `SectionFrame`s and [`FloatingLinkCard`](../../src/components/canvas/FloatingLinkCard.tsx) tiles with absolute `position`, shared `DndContext`, draggable ids prefixed `float:` vs section ids.
- **App / editor:** [`App.tsx`](../../src/App.tsx) uses a `linkEditorScope` discriminant (`section` vs `standalone`) so save/delete routes to `sections[].links` or `standaloneLinks`.
- **Search:** [`CommandPalette.tsx`](../../src/components/search/CommandPalette.tsx) and [`background.ts`](../../src/background.ts) include standalone links under an **Ungrouped** group (sections first, then standalone in omnibox match order).

## Constraints

- **dnd-kit:** Section drag vs standalone link drag must not conflict (activation distance, handles, or separate `DndContext` strategy—same class of problem as future link-between-sections drag).
- **Storage:** More entities in `chrome.storage.sync` increases quota pressure (see [`data-portability-storage.md`](./data-portability-storage.md)).
- **Z-order:** Overlapping links and sections may need explicit stacking (drag brings to front).

## Open questions (follow-ups)

- Rename or localize the synthetic list label (**Ungrouped** is fixed for v1).
- Optional: viewport-centered or user-chosen default spawn instead of the current staggered offset from [`App.tsx`](../../src/App.tsx).

## Notes / Rejected Ideas

- **Rejected:** A horizontal or fixed “strip” / dock for standalone links on canvas—the product direction is free placement anywhere on the canvas, not a separate chrome region.
