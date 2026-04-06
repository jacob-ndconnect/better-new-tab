# Drag-and-drop links between sections

## Status

**Implemented** (canvas + list, edit mode for reparenting).

## Goal

Move links between sections or out to ungrouped (standalone) storage using drag-and-drop, reusing [`@dnd-kit/core`](https://docs.dndkit.com/).

## Behavior

- **Edit mode:** Reparenting (section ↔ section, or ↔ ungrouped) runs only while [`editMode`](../../src/types/index.ts) is on. Repositioning existing canvas floating tiles when *not* in edit mode is unchanged.
- **Canvas:** Use the **two-line grip** on a link (not the whole section). Drop on another section’s link area to move the link there, or on **empty canvas** (behind sections) to move it to **ungrouped** ([`standaloneLinks`](../../src/types/index.ts)). New ungrouped position uses the drop location ([`canvasDropPosition.ts`](../../src/lib/canvasDropPosition.ts), [`applyLinkDragEnd.ts`](../../src/lib/applyLinkDragEnd.ts)).
- **List:** Same grip. Each row’s horizontal strip is a drop target. The **Ungrouped** row appears in edit mode even when empty so links can be dragged out of a section. **DragOverlay** renders the dragged card so it is not clipped by `overflow-x-auto` ([`ListView.tsx`](../../src/components/list/ListView.tsx)).
- **Drop feedback:** While a link drag hovers a target, an overlay shows **“Move to this section”** (or **“Move to Ungrouped”** / **“Move outside sections”** on canvas) ([`LinkDropTargetOverlay.tsx`](../../src/components/dnd/LinkDropTargetOverlay.tsx), [`CanvasStandaloneDropLayer.tsx`](../../src/components/canvas/CanvasStandaloneDropLayer.tsx)). Highlights avoid `backdrop-blur` on full-canvas layers so the fixed dot background stays visible.

## Architecture

- **State:** [`moveLinkInState`](../../src/lib/linkMove.ts) updates [`sections`](../../src/types/index.ts) and [`standaloneLinks`](../../src/types/index.ts) immutably; [`applyLinkDragEnd`](../../src/lib/applyLinkDragEnd.ts) interprets [`DragEndEvent`](https://docs.dndkit.com/api-documentation/context-provider#event-handlers) and is invoked from [`Canvas.tsx`](../../src/components/canvas/Canvas.tsx) and [`ListView.tsx`](../../src/components/list/ListView.tsx) via `save((prev) => …)`.
- **IDs:** [`linkDragIds.ts`](../../src/components/dnd/linkDragIds.ts) — `slink:{sectionId}:{linkId}`, `float:{linkId}`, `drop-section:{sectionId}`, `drop-standalone` (canvas ungrouped zone).
- **Section vs link drag:** Section move uses the **top handle** only; link drag uses the **link grip** ([`SectionFrame.tsx`](../../src/components/canvas/SectionFrame.tsx), [`SectionLinkDraggable.tsx`](../../src/components/dnd/SectionLinkDraggable.tsx)).
- **Collision:** [`preferSectionOverStandalone`](../../src/components/dnd/preferSectionDropCollision.ts) prefers a section strip over the full-canvas standalone target when both hit.
- **Active drag detection:** [`isActiveLinkDrag`](../../src/components/dnd/isActiveLinkDrag.ts) uses id prefixes with `active` from [`useDroppable`](https://docs.dndkit.com/api-documentation/droppable) so drop overlays stay in sync.

## Not in scope (yet)

- Reorder within a section via drag (links are appended to the target list today).
- Undo / toast for accidental moves.

## Historical notes

Earlier draft mentioned nested `dnd-kit` concerns and scroll quirks; the shipped approach uses drag handles, `DragOverlay` in list view, and pointer-based collision without extra blur on the canvas drop layer.
