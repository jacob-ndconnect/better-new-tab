# Roadmap

Inferred from the current codebase and architecture ([`PROJECT.md`](./PROJECT.md)). Status reflects implementation today, not commitment order.

**Canvas drag:** `DRAGGABLE_ONLY_IN_EDIT` in [`Canvas.tsx`](./src/components/canvas/Canvas.tsx) is intentionally `false`—sections stay draggable when not in edit mode (handle hint shows on hover in view mode). Only set it to `true` if the product should restrict moves to edit mode.

| Status | Item |
|--------|------|
| **done** | Core new tab override: sections and links, Canvas vs List layout, `chrome.storage.sync` via [`useStorage`](./src/hooks/useStorage.ts). |
| **done** | Command palette ([`CommandPalette.tsx`](./src/components/search/CommandPalette.tsx)) with Mod+K (configurable in settings); search uses label, domain, and optional `searchTerms`. |
| **done** | Omnibox keyword `pin` in [`manifest.json`](./public/manifest.json) with matching logic in [`background.ts`](./src/background.ts) reading the same storage key as the page. |
| **done** | Settings modal ([`SettingsModal.tsx`](./src/components/settings/SettingsModal.tsx)): shortcut for search/settings, canvas section label size, support tab; persisted in `AppState.settings`. |
| **done** | Editors: section (name, accent), link (URL, label, search terms, badge); theme provider; empty state; edit toolbar with layout toggle and canvas “reset positions”. |
| **done** | Canvas section drag with `@dnd-kit` using draggable `transform` (not delta) for scrollable canvas ([`Canvas.tsx`](./src/components/canvas/Canvas.tsx), [`SectionFrame.tsx`](./src/components/canvas/SectionFrame.tsx)). |
| **in-progress** | Production cleanup: `[Canvas]` and `[useStorage]` `console.log` calls still present ([`Canvas.tsx`](./src/components/canvas/Canvas.tsx), [`useStorage.ts`](./src/hooks/useStorage.ts)). |
| **planned** | Implement `Link.customIcon` end-to-end ([`types/index.ts`](./src/types/index.ts) marks it optional/future; [`LinkCard.tsx`](./src/components/canvas/LinkCard.tsx) only uses favicon/letter). |
| **planned** | Reorder links inside a section and/or reorder sections (list layout has fixed order; no `dnd-kit` on links today). |
| **planned** | Appearance parity: `settings.sectionLabelSize` applies to canvas headers only; list headers in [`SectionRow.tsx`](./src/components/list/SectionRow.tsx) use fixed classes. |
| **planned** | Data portability: export/import `AppState` JSON and awareness of `chrome.storage.sync` size/item limits (relevant if `customIcon` stores base64). |
| **planned** | Command palette navigation polish: today opens via `window.location.href` in the new tab page only; optional new-tab behavior or other dispositions if product needs it. |
| **done** | Free-floating canvas links: `AppState.standaloneLinks` with per-tile `{x,y}` (no strip UI); [`FloatingLinkCard`](./src/components/canvas/FloatingLinkCard.tsx) + [`Canvas`](./src/components/canvas/Canvas.tsx) DnD; **Add link** next to **Add section** in edit mode ([`EditModeToolbar`](./src/components/editor/EditModeToolbar.tsx)); list **Ungrouped** row ([`ListView`](./src/components/list/ListView.tsx)); palette + omnibox ([`CommandPalette`](./src/components/search/CommandPalette.tsx), [`background.ts`](./src/background.ts)); [`AppState`](./src/types/index.ts), [`useStorage`](./src/hooks/useStorage.ts), [`App`](./src/App.tsx). |
| **planned** | Folder view: hierarchical or grouped navigation (folders vs flat sections); likely new layout mode or nested model on top of current sections. |
| **planned** | Pin from context menu: extension context menu on page/link to add URL into storage ([`background.ts`](./src/background.ts), manifest `permissions` / `host_permissions` as needed). |
| **planned** | Visual refresh—corkboard feel (texture, depth, pin metaphors), optional minimalist density, and more purposeful motion; mostly [`index.css`](./src/index.css), canvas chrome, and shared card styles. |
| **planned** | Richer theming: presets or tokens beyond light/dark/system ([`theme-provider.tsx`](./src/components/theme-provider.tsx), settings + CSS variables). |
| **planned** | Stronger link visual differentiation (variants, density, or non-badge cues) and better layouts for large sections (wrapping grids, row/column balance in [`SectionFrame`](./src/components/canvas/SectionFrame.tsx) / [`SectionRow`](./src/components/list/SectionRow.tsx)). |
| **planned** | Drag-and-drop links between sections (cross-drop targets with `@dnd-kit`, immutably update `sections` via `save` in [`App.tsx`](./src/App.tsx)). |
| **planned** | Browser data integration: surface bookmarks, Reading List, and/or history where Chrome APIs and privacy expectations allow (new permissions, likely background + optional UI modules). |

Feature notes for **planned** and **in-progress** rows live under [`docs/features/`](./docs/features/).
