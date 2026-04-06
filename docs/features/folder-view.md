# Folder view

## Goal

Offer a way to browse pins in a folder-like hierarchy (nested groups, collapsible trees, or filesystem metaphors) instead of or alongside flat sections.

## Architecture fit

- **Model:** Current [`Section`](../../src/types/index.ts) is flat with `links[]`. Folders imply nesting (`children: Section[] | Link[]`) or a separate `Folder` type and IDs for parent/child.
- **UI:** New layout component (e.g. `src/components/folder/`) or a third `layoutMode` in [`AppState`](../../src/types/index.ts), wired from [`App.tsx`](../../src/App.tsx) like canvas/list.
- **State:** All mutations still funnel through `save((prev) => …)` per [`PROJECT.md`](../../PROJECT.md).

## Constraints

- **dnd-kit:** Drag between folders + canvas list mode complexity; may phase: read-only tree first.
- **Migration:** Existing users need a default tree that mirrors current flat sections.
- **Mobile / narrow widths:** Tree + canvas may compete for space.

## Open questions

- Folders as visual grouping only vs true containment for links?
- Single root vs multiple top-level folders?

## Notes / Rejected Ideas

-
