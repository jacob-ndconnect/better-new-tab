# Folder view

## Goal

Let users organize pins into **named folders** that behave like **macOS Launchpad folders**: the main surface shows folder tiles (and optionally loose pins); tapping or opening a folder transitions into a **focused sub-view** that shows only the links inside that folder, with a clear way to go back to the top level.

This is a **drill-in containment** model (links live inside folders), not primarily a collapsible tree in the margin—though a compact tree could complement the same data model later.

## Architecture fit

- **Model:** Current [`Section`](../../src/types/index.ts) is flat with `links[]`. Folders imply nesting (`children: Section[] | Link[]`) or a separate `Folder` type and IDs for parent/child.
- **UI:** New layout or mode: folder grid + **folder detail layer** (full-area or modal-like panel) for the “inside the folder” link grid, e.g. under `src/components/folder/` or a `layoutMode` in [`AppState`](../../src/types/index.ts), wired from [`App.tsx`](../../src/App.tsx) like canvas/list.
- **State:** All mutations still funnel through `save((prev) => …)` per [`PROJECT.md`](../../PROJECT.md). Persist which folder is open (or treat it as ephemeral UI state only).

## Constraints

- **dnd-kit:** Drag between folders and between top-level vs inside-folder views adds complexity; may phase: read-only drill-in first, then DnD.
- **Migration:** Existing users need a default layout that mirrors current flat sections (e.g. one folder per section, or a single “All” folder).
- **Mobile / narrow widths:** Drill-in fits small screens well; ensure back affordance and no reliance on hover.

## Open questions

- Should **top-level** show only folders, or folders **and** unpinned-to-folder links side by side (Launchpad allows both)?
- **Animation:** subtle zoom vs slide vs cross-fade when entering/leaving a folder?
- **Depth:** Launchpad is one level inside a folder—allow nested folders or cap at one level for v1?

## Notes / Rejected Ideas

-
