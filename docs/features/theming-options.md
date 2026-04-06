# Richer theming options

## Goal

Go beyond light / dark / system: accent presets, optional custom colors, or density-related tokens so the new tab feels more personal without forking the whole design system.

## Architecture fit

- **Today:** [`theme-provider.tsx`](../../src/components/theme-provider.tsx) persists mode in `localStorage` and sets `class` on `document.documentElement`.
- **Extension:** Add fields to [`Settings`](../../src/types/index.ts) (e.g. accent preset, optional hex overrides); merge defaults in [`useStorage.ts`](../../src/hooks/useStorage.ts) like other settings keys.
- **CSS:** Map settings to CSS variables in `:root` or a scoped wrapper—align with Tailwind v4 theme patterns already in [`index.css`](../../src/index.css).

## Constraints

- **Contrast:** Section accents and [`getContrastColor`](../../src/lib/color.ts) paths must stay accessible when users pick arbitrary colors.
- **shadcn / radix:** Dialogs and command palette should inherit variables consistently.
- **Sync vs local:** User may expect theme with data; `chrome.storage.sync` vs `localStorage` split (today theme is local only).

## Open questions

- Persist appearance in `AppState` (synced) vs keep theme local-only?
- Preset gallery vs free-form color pickers only?

## Notes / Rejected Ideas

-
