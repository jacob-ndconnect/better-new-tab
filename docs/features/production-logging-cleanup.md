# Production logging cleanup

## Goal

Remove or gate debug logging so shipped extension builds do not spam the console on every save and drag operation.

## Architecture fit

- [`src/hooks/useStorage.ts`](../../src/hooks/useStorage.ts): `save` logs section ids and positions under `[useStorage]`.
- [`src/components/canvas/Canvas.tsx`](../../src/components/canvas/Canvas.tsx): `handleDragStart`, `handleDragEnd`, and post-save paths log under `[Canvas]`.
- State flow is unchanged: logging is orthogonal to `save((prev) => …)` and dnd-kit handlers.

## Constraints

- MV3 new tab page: DevTools is easy to open; developers may still want opt-in debug (env flag or `chrome.storage.local` debug key) if logs are removed entirely.
- No backend: any “remote logging” would be a separate product decision.

## Open questions

- Delete logs vs wrap in `import.meta.env.DEV` (Vite) vs a runtime toggle?
- Should drag logging be replaced with a single optional performance/metrics hook later?

## Notes / Rejected Ideas

-
