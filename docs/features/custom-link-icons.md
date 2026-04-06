# Custom link icons (`customIcon`)

## Goal

Let users override the default favicon/letter placeholder using `Link.customIcon` (URL or small embedded image), as hinted in [`src/types/index.ts`](../../src/types/index.ts).

## Architecture fit

- **Model:** `Link` already includes optional `customIcon?: string` with an inline “future” comment.
- **Rendering:** [`LinkCard.tsx`](../../src/components/canvas/LinkCard.tsx) uses [`getFaviconUrl`](../../src/lib/favicon.ts) / fallback URL, then letter placeholder—would branch to `customIcon` when set.
- **Editing:** [`LinkEditor.tsx`](../../src/components/editor/LinkEditor.tsx) would need a field (URL input, file picker with base64, or both) and preview using the same `LinkCard` preview path.
- **Persistence:** [`useStorage.ts`](../../src/hooks/useStorage.ts) persists full `AppState` to `chrome.storage.sync` with no field stripping.

## Constraints

- **Storage quota:** `chrome.storage.sync` has strict total byte and per-item limits; large base64 strings for many links can fail writes or crowd out other data—may need `storage.local`, compression, or URL-only icons.
- **Security / CSP:** Extension pages may restrict remote images; invalid URLs should fail gracefully like current favicon `onError` handling.
- **Privacy:** External icon URLs leak fetch timing to third parties (similar to Google favicon helper today).

## Open questions

- URL-only vs upload-to-base64 vs both?
- Cap dimensions/file size in the editor before save?
- Should CommandPalette / omnibox suggestions show custom icons or keep text-only for performance?

## Notes / Rejected Ideas

-
