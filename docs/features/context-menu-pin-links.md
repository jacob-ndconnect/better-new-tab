# Pin links from context menu

## Goal

Let users add the current tab’s URL (or a link’s URL from context) into Better New Tab data without opening the new tab page first.

## Architecture fit

- **Extension entry:** MV3 [`chrome.contextMenus`](https://developer.chrome.com/docs/extensions/reference/api/contextMenus) registered from [`src/background.ts`](../../src/background.ts) (or a dedicated background module included in the build).
- **Storage:** Same `appState` key as [`useStorage.ts`](../../src/hooks/useStorage.ts); background reads, merges a new `Link` (and picks/creates target `Section`), then `chrome.storage.sync.set`.
- **Manifest:** `contextMenus` permission; possibly `activeTab` or host access depending on whether URL is taken from tab vs link menu id.

## Constraints

- **No React on background:** Keep merge logic small and testable; avoid duplicating full `AppState` validation or import heavy app code unless build splits allow.
- **Race conditions:** New tab page open + context menu write both updating storage—align with `hasUserSavedRef`-style concerns only on the page; background writes should merge safely.
- **User choice:** “Which section?” may require a default section id in settings or a lightweight popup (future).

## Open questions

- Single menu item “Pin to Better New Tab” vs submenu per section?
- Dedupe by URL when already pinned?

## Notes / Rejected Ideas

-
