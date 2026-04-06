# Browser data integration (bookmarks, Reading List, history)

## Goal

Integrate with Chrome data sources so the new tab can surface or import bookmarks, Reading List items, and/or recent history alongside manually pinned links—where APIs and privacy expectations allow.

## Architecture fit

- **APIs:** [`chrome.bookmarks`](https://developer.chrome.com/docs/extensions/reference/api/bookmarks), [`chrome.readingList`](https://developer.chrome.com/docs/extensions/reference/api/readingList) (availability and methods vary by Chrome version), [`chrome.history`](https://developer.chrome.com/docs/extensions/reference/api/history)—each needs manifest permissions and usually background or offscreen patterns for heavy reads.
- **UI:** Read-only lists or “import as pin” actions in new components; keep chrome.storage pins as source of truth unless product shifts to live bookmark trees.
- **Separation:** Native data stays in the browser; extension only reads or copies into `AppState` when user explicitly imports.

## Constraints

- **Permissions:** `bookmarks`, `history`, `readingList` are sensitive; Chrome Web Store review and clear UX copy.
- **Privacy:** History especially—default off, explicit opt-in, retention limits, no silent exfiltration.
- **Sync:** Bookmarks sync via Chrome account; `appState` sync via `chrome.storage.sync`—two systems unless you only link externally.

## Open questions

- Live mirror vs one-shot import into sections?
- Which surfaces ship first (bookmarks only vs reading list vs history)?

## Notes / Rejected Ideas

-
