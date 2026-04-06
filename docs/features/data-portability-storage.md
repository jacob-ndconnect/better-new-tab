# Data portability and storage limits

## Goal

Let users back up and restore their layout (export/import JSON) and stay within Chrome extension storage limits so saves never silently fail as data grows.

## Architecture fit

- **Single blob:** Entire [`AppState`](../../src/types/index.ts) is stored under one `chrome.storage.sync` key in [`useStorage.ts`](../../src/hooks/useStorage.ts) (`STORAGE_KEY = "appState"`).
- **Background:** [`background.ts`](../../src/background.ts) reads the same key shape for omnibox; any schema/version field should stay backward compatible or migrate in one place.
- **Import flow:** Likely a Settings tab action: file pick → validate → `save` with merged or replaced state; mirror existing `migrateSections` / settings merge patterns in `useStorage`.

## Constraints

- **`chrome.storage.sync`:** Per-item and total quota are small relative to rich media; base64 icons or huge `searchTerms` strings increase risk ([`custom-link-icons.md`](./custom-link-icons.md) overlaps).
- **Sync semantics:** Sync propagates across signed-in Chrome profiles; import should be explicit about replacing vs merging to avoid surprise data loss.
- **MV3:** No Node fs in the page; download/upload uses browser APIs (`Blob`, `<a download>`, `input type="file"`).

## Open questions

- Export includes full `AppState` vs only `sections` + layout flags?
- Version field (`appStateVersion`) for future migrations?
- Fallback to `chrome.storage.local` for oversized states vs hard caps in UI?

## Notes / Rejected Ideas

-
