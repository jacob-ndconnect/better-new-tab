# Appearance: list layout parity for section labels

## Goal

Apply `Settings.sectionLabelSize` (or an equivalent typography scale) to section titles in List layout, matching the configurability already used on canvas section headers.

## Architecture fit

- **Settings:** [`Settings`](../../src/types/index.ts) includes `sectionLabelSize` (`SectionLabelSize` Tailwind class tokens); defaults and merge logic live in [`useStorage.ts`](../../src/hooks/useStorage.ts).
- **Config UI:** [`settingsConfig.ts`](../../src/components/settings/settingsConfig.ts) exposes “Section label size” under Appearance with options mapped to those tokens.
- **Canvas:** [`SectionFrame.tsx`](../../src/components/canvas/SectionFrame.tsx) applies `sectionLabelSize` to the section title pill via `cn(..., sectionLabelSize)`.
- **List gap:** [`SectionRow.tsx`](../../src/components/list/SectionRow.tsx) uses fixed `text-sm` on the `<h2>` and does not read `settings.sectionLabelSize`; [`ListView`](../../src/components/list/ListView.tsx) would need `settings` passed down (today it only receives `sections` and edit callbacks from [`App.tsx`](../../src/App.tsx)).

## Constraints

- Tailwind class names must be statically discoverable if the build uses content scanning; the current `SectionLabelSize` union is already a fixed set—avoid dynamic string concatenation that purges classes.
- Very large sizes in a compact list row may overflow or clash with the accent dot layout—may need max-width or truncation rules.

## Open questions

- Should list mode ignore extreme sizes (cap at `text-xl`) for density?
- Does the toolbar/search chrome get related typography tokens later, or scope strictly to section headers?

## Notes / Rejected Ideas

-
