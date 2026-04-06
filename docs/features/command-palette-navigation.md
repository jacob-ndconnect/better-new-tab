Read PROJECT.md thoroughly. Then survey the codebase to understand what's actually been built — focus on src/App.tsx, src/types/index.ts, src/hooks/, and src/components/.
Based on that, create two things:

1. ROADMAP.md at the project root. Infer a realistic feature roadmap from the codebase — things that are partially built, obvious next steps given the architecture, or common gaps in this kind of tool. Keep each entry to 1–2 lines. Include a status column: planned, in-progress, or done. Don't invent wild features — stay grounded in what the project is.
2. A docs/features/ directory with one markdown file per feature on the roadmap. For each, document: the goal, how it fits the current architecture (reference actual files/patterns from the codebase), any constraints you can already see (storage limits, dnd-kit quirks, Chrome extension restrictions, etc.), and an open questions section. Leave the "Notes / Rejected Ideas" section stubbed but empty — that gets filled over time.
   Don't create feature files for things that are already fully implemented — only for planned or in-progress work.# Command palette navigation behavior

## Goal

Refine how choosing a link from the palette navigates (current tab vs new tab, focus, and edge cases) while keeping Mod+K behavior predictable inside the new tab page.

## Architecture fit

- [`CommandPalette.tsx`](../../src/components/search/CommandPalette.tsx): `openLink` sets `window.location.href = url` and closes the dialog via `onOpenChange(false)`; selection uses cmdk `CommandItem` `onSelect`.
- [`App.tsx`](../../src/App.tsx): owns `commandOpen` state and passes `sections` only—no navigation policy props yet.
- **Contrast:** [`background.ts`](../../src/background.ts) `omnibox.onInputEntered` uses `disposition` to choose `chrome.tabs.create` vs `tabs.update`; the in-page palette has no parallel today.

## Constraints

- **Context:** The palette runs in the overridden new tab document; `window.open` or `chrome.tabs` APIs require extension permissions—`manifest.json` currently has `storage` and `favicon`, not `tabs` for the page context (background already uses `tabs` API where available as service worker).
- **Same-tab navigation:** Replacing the new tab page is usually desired for a “launcher” but may surprise users who expected a new tab for links.
- **cmdk:** Keyboard selection and `onSelect` should stay accessible; any extra modifiers (e.g. open in new tab) need clear UX and possible `useHotkey` conflicts.

## Open questions

- Add optional “open in new tab” via modifier key, secondary action, or setting?
- If using `chrome.tabs`, should the UI path go through a tiny message to `background.ts` for consistent policy with omnibox?

## Notes / Rejected Ideas

-
