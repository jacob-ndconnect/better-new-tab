# Build performance (bundle size & assets)

## Goal

Shrink the shipped new-tab payload so first paint and parse stay fast in a Chrome extension context: address Vite’s **>500 kB** main-chunk warning and trim **large static assets** (notably the support avatar image).

Baseline from a typical `npm run build` report:

- **`dist/assets/main-*.js`** — on the order of **~750+ kB** minified (**~240+ kB** gzip), above Rollup’s default chunk warning threshold.
- **`dist/assets/me_and_meebo-*.JPG`** — **~900+ kB**, largest single file in `dist/` (imported as a module, so it ships with the app bundle graph).

## Architecture fit

- **Entry:** [`src/main.tsx`](../../src/main.tsx) → [`src/App.tsx`](../../src/App.tsx).
- **Vite:** [`vite.config.ts`](../../vite.config.ts) — single Rollup input `index.html`, `base: './'` for extension-relative asset URLs; post-plugin bundles [`src/background.ts`](../../src/background.ts) to `dist/background.js` (separate from the main chunk).
- **Fonts:** [`src/index.css`](../../src/index.css) imports `@fontsource-variable/figtree` (already **woff2**, modest size vs JS/image — lower priority than JS/image work).

## Implementation levers (codebase-specific)

### 1. Support avatar image (`~900 kB`)

**Where:** [`src/components/settings/settingsConfig.ts`](../../src/components/settings/settingsConfig.ts) imports `@/assets/me_and_meebo.jpg` and assigns it to `SUPPORT_CONFIG.avatar`. That pulls the JPEG into the **main** module graph because `SETTINGS_SECTIONS` / `SUPPORT_CONFIG` load with settings UI.

**Options (pick one or combine):**

- **Resize + compress** the source asset to the **max displayed size** (Support section avatar is small on screen — no need for multi‑megapixel JPEG).
- **Modern format:** replace with **WebP** or **AVIF** (Vite will emit hashed assets; ensure `<img>` / CSS usage supports the format, or provide a small fallback).
- **`public/` + URL string:** move a compressed file to `public/` (e.g. `public/support-avatar.webp`) and set `avatar` to `"/support-avatar.webp"` (with `base: './'`, use a path that resolves correctly in the extension — often **`./support-avatar.webp`** from the new tab page root).
- **Lazy boundary:** defer loading the support image until the Support tab is active (e.g. dynamic `import()` of a tiny module that only exports the image URL, or pass `src` from `SupportSectionContent` after mount). This **does not** reduce total download if the user opens Support, but avoids competing with first paint of the main grid.

### 2. Main JavaScript chunk (Vite “chunks are larger than 500 kB”)

**Eager graph today:** [`src/App.tsx`](../../src/App.tsx) statically imports **Canvas**, **ListView**, **FolderView**, **CommandPalette**, **EditModeToolbar**, **SectionEditor**, **LinkEditor**, **SettingsModal**, and **DotBackground**. Everything participates in the initial Rollup chunk unless split.

**Code splitting (recommended first win):**

- Wrap heavy UI in **`React.lazy`** + **`Suspense`** with a minimal fallback (e.g. existing “Loading…” pattern from [`useStorage`](../../src/hooks/useStorage.ts)):
  - **Layout modes:** only one of Canvas / List / Folder is visible — lazy-load **`Canvas`**, **`ListView`**, and **`FolderView`** (and possibly **`DotBackground`** with Canvas) so the initial parse skips two of three layouts.
  - **Modals / overlays:** **`SettingsModal`**, **`CommandPalette`** (and/or **`cmdk`** via [`src/components/ui/command.tsx`](../../src/components/ui/command.tsx)), **`SectionEditor`**, **`LinkEditor`** are good candidates — users open them after interaction.
- Keep **shared state** (`useStorage`, hotkeys) in the parent; lazy components receive props/callbacks as today.

**`manualChunks` (optional):** in [`vite.config.ts`](../../vite.config.ts) under `build.rollupOptions.output.manualChunks`, group **`react` / `react-dom`**, **`@dnd-kit/*`**, or **`radix-ui`** into vendor chunks. **Caveat:** verify **`base: './'`** and the extension manifest still load all emitted chunks from `dist/assets/` (no missing relative paths).

### 3. Heavy dependencies (targeted audits)

| Dependency | Where used | Note |
|------------|------------|------|
| **`mathjs`** | [`src/components/GradualBlur.tsx`](../../src/components/GradualBlur.tsx) (`import * as math from 'mathjs'`) | Full `mathjs` is **very large** for a blur helper. Prefer **narrow imports** (`mathjs/number` + explicit functions), **`create` + minimal `all`**, or **inline** the small amount of math (e.g. Bezier / interpolation) if usage is limited. |
| **`gsap`** | [`src/lib/folderLinkFlip.ts`](../../src/lib/folderLinkFlip.ts) | Only needed for **folder** layout FLIP. Consider **dynamic `import('gsap')`** when `layoutMode === 'folders'` or inside the animation path so list/canvas-first sessions avoid paying for GSAP up front. |
| **`@phosphor-icons/react`** | Many components | Some files already use **`@phosphor-icons/react/dist/ssr`** ([`SectionFrame`](../../src/components/canvas/SectionFrame.tsx), [`EditModeToolbar`](../../src/components/editor/EditModeToolbar.tsx), etc.). Align on **per-icon or SSR subpaths** everywhere to improve tree-shaking vs the root barrel. |
| **`cmdk`** | [`src/components/ui/command.tsx`](../../src/components/ui/command.tsx) | Pulled in with **`CommandPalette`**. Lazy-loading the palette (or the command UI module) defers **cmdk** parse cost. |

### 4. Measurement

- **Analyze:** `npm run build` and inspect Rollup output; optionally add **`rollup-plugin-visualizer`** (dev-only) to confirm which modules dominate after changes.
- **Chrome extension:** after splitting, load unpacked `dist/` and confirm **no 404** for chunk files under `web_accessible_resources` if applicable (new tab page usually loads all assets from extension origin — still verify once).

## Constraints

- **Chrome MV3 new tab page** must resolve **all** JS/CSS/asset URLs with **`base: './'`**; any chunking change needs a quick manual test in an unpacked build.
- **Service worker** (`background.js`) is built separately — perf work on the **page** bundle does not automatically shrink `background.js`.

## Open questions

- Should **folder FLIP** keep GSAP or move to **CSS View Transitions** / **Web Animations** where supported, to drop a dependency?
- Is **GradualBlur** worth the **`mathjs`** cost, or should presets use **precomputed** stops?

## Notes / rejected ideas

- Raising **`build.chunkSizeWarningLimit`** only silences the warning; it does not improve user-visible performance.
