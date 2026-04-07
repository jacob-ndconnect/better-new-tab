# Folder view

## Status

**Done for now (v1)** — Third layout mode (`layoutMode: "folders"`) is implemented and wired from [`App.tsx`](../../src/App.tsx) and the edit toolbar ([`EditModeToolbar.tsx`](../../src/components/editor/EditModeToolbar.tsx)).

Shipped behavior:

- **Top level:** Section grid as folder tiles; **Ungrouped** holds links not in a named folder (Launchpad-style mix of folders and loose pins).
- **Drill-in:** Open a folder for its link grid; **Escape** or UI back to return. Click-outside-to-close uses capture-phase checks against the folder surface ([`FolderView.tsx`](../../src/components/folder/FolderView.tsx)).
- **Motion:** FLIP via [`folderLinkFlip.ts`](../../src/lib/folderLinkFlip.ts) + GSAP — panel backdrop grows from the tile rect; each link animates from its thumbnail; extras fade in.
- **Edit mode DnD:** Same link reparenting as canvas/list ([`applyLinkDragEnd`](../../src/lib/applyLinkDragEnd.ts)): drop on folder tiles, open folder surfaces, and **Move to** chips. In edit mode, **the whole link card** is the drag handle (not only the grip); native URL/image drag is disabled on [`LinkCard`](../../src/components/canvas/LinkCard.tsx) so `@dnd-kit` owns the gesture.

**Data model:** Unchanged flat [`Section`](../../src/types/index.ts) list with `links[]` per section. In folder mode each stored section is a **folder tile**; [`standaloneLinks`](../../src/types/index.ts) are shown under a synthetic **Ungrouped** folder (same id as list view: [`UNGROUPED_SECTION_ID`](../../src/types/index.ts)). No nested sections—only one drill-in level.

**State:** Which folder is open is **ephemeral** (`useState` in [`FolderView.tsx`](../../src/components/folder/FolderView.tsx)), not persisted. `layoutMode: "folders"` is persisted in [`useStorage`](../../src/hooks/useStorage.ts) like other layout modes.

**Possible later:** Deeper nesting, extra animation variants, or small-screen-only polish — not required for the current milestone.

## Goal (original)

Let users organize pins into **named folders** that behave like **macOS Launchpad folders**: the main surface shows folder tiles (and loose pins); opening a folder focuses a **sub-view** of links inside that folder, with a clear way back.

This is **drill-in containment**, not a collapsible tree in the margin.

## Architecture fit

- **Foundation:** Cross-section link reparenting ([`drag-links-between-sections.md`](./drag-links-between-sections.md)) — [`moveLinkInState`](../../src/lib/linkMove.ts), [`applyLinkDragEnd`](../../src/lib/applyLinkDragEnd.ts); folder view reuses droppable IDs and overlay patterns ([`SectionLinkDraggable`](../../src/components/dnd/SectionLinkDraggable.tsx), [`LinkDropTargetOverlay`](../../src/components/dnd/LinkDropTargetOverlay.tsx)).
- **State:** Link/section mutations go through `save((prev) => …)` per [`PROJECT.md`](../../PROJECT.md). Open-folder UI state is local to the folder view component.

## Constraints

- **Mobile / narrow widths:** Drill-in works without hover; back affordance is keyboard + UI.

## Resolved (v1)

- **Top-level content:** Folders and ungrouped links together — **yes** (Ungrouped section).
- **Animation:** FLIP from tile + thumbnails — **shipped** as above.
- **Depth:** One level inside a folder — **yes** for v1; nested folders not in scope.

## Notes / Rejected Ideas

- View Transitions API was explored and removed in favor of FLIP + GSAP for predictable timing with the drill-in panel.
