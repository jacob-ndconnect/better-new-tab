# Better New Tab — Project Reference

A Chrome extension that replaces the default new tab page with a customizable command center. Users organize links into sections, view them in Canvas (free-form drag) or List layout, and search via Cmd/Ctrl+K.

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** + **shadcn/ui** (radix-ui, cmdk)
- **@dnd-kit** for drag-and-drop
- **Chrome Extension** (Manifest V3) — `chrome_url_overrides.newtab`
- **chrome.storage.sync** for persistence

---

## Data Model

**Location:** `src/types/index.ts`

| Type | Description |
|------|-------------|
| `Link` | `id`, `url`, `label`, optional `badge` (emoji + color), optional `customIcon` |
| `Section` | `id`, `name`, `accentColor`, `links[]`, `position` (x, y for Canvas) |
| `AppState` | `sections[]`, `layoutMode` ("canvas" \| "list"), `editMode` (boolean) |
| `BadgeStyle` | `emoji`, `color` (hex) |

---

## Entry Point & App Structure

### `src/main.tsx`
- Renders `App` inside `ThemeProvider` and `StrictMode`
- ThemeProvider handles dark/light/system via localStorage

### `src/App.tsx`
Root component. Responsibilities:
- Uses `useStorage` for state and persistence
- Shows loading until `loaded`
- Renders `EmptyState` when no sections, else Canvas or ListView based on `layoutMode`
- Manages dialogs: `SectionEditor`, `LinkEditor`
- Handles `handleEscape` (close dialog or exit edit mode)
- Passes `save` as updater: `save((prev) => ({ ...prev, ... }))` to avoid stale closures

**Key handlers:**
- `handleSectionSave` — create/update section
- `handleLinkSave` — create/update link in `sectionIdForLink`
- `handleLinkDelete` — delete link from `sectionIdForLink`
- `openEditSection`, `openEditLink`, `openAddLink` — open editors

---

## Hooks

### `src/hooks/useStorage.ts`
**Purpose:** Load and persist `AppState` via `chrome.storage.sync`.

- **Returns:** `{ state, save, loaded }`
- **save:** Accepts `AppState` or `(prev: AppState) => AppState`; uses functional `setState` and `queueMicrotask` for storage write
- **Migration:** `migrateSections` adds valid `position` for sections missing it (3-column grid)
- **Guard:** `hasUserSavedRef` prevents initial load from overwriting user saves if load callback runs late

### TanStack HotKeys
**Purpose:** Platform-aware keyboard shortcuts (Mod+K = ⌘K on Mac, Ctrl+K on Windows).

- **Provider:** `HotkeysProvider` wraps App in `main.tsx`
- **CommandPalette:** `useHotkey('Mod+K', ...)` in App.tsx
- **Display:** `formatForDisplay('Mod+K')` in EditModeToolbar for platform-appropriate key combo

### `src/hooks/useEscape.ts`
**Purpose:** Escape key triggers a callback.

- **Usage:** `useEscape({ onEscape: handleEscape })`
- **Options:** `enabled` (default true)

---

## Components

### Canvas Layout (`src/components/canvas/`)

#### `Canvas.tsx`
Free-form canvas with drag-and-drop sections.

- **DndContext** (PointerSensor, 8px activation)
- **Drag behavior:** Uses `transform` from `useDraggable` (not `event.delta`) because dnd-kit’s delta is wrong in scrollable containers
- **Flow:** `SectionFrame` reports transform via `onTransformChange` → stored in `transformRef` → on `handleDragEnd`, `newPosition = startPos + transform`
- **normalizePosition:** Ensures valid `{x,y}` or falls back to grid position
- **Layout:** Scrollable div (`overflow-auto`), dot grid in edit mode (`canvas-grid`)

#### `SectionFrame.tsx`
Draggable section card (Canvas only).

- **useDraggable** — disabled when not in edit mode
- **onTransformChange** — reports transform to parent for position calculation
- **Renders:** Section name, accent color, LinkCards, Add Link button (edit mode), gear icon (edit section)

#### `LinkCard.tsx`
iOS-style link card: favicon or letter placeholder, optional badge, label.

- **Edit mode:** Click opens editor; hover shows pencil overlay
- **View mode:** Click navigates to `link.url`
- **Favicon:** `getFaviconUrl(link.url)` (Google favicon API); fallback to first letter with generated color

---

### List Layout (`src/components/list/`)

#### `ListView.tsx`
Scrollable list of sections.

#### `SectionRow.tsx`
Single section: header (name, accent dot, edit button), horizontal scroll of LinkCards, Add Link button.

---

### Search

#### `src/components/search/CommandPalette.tsx`
- **Trigger:** Cmd/Ctrl+K (via `useKeyboard`)
- **cmdk**-based dialog; search by label or domain
- **Groups:** By section
- **Select:** Opens link in current tab (`window.location.href`)

---

### Edit Mode & Toolbar

#### `src/components/editor/EditModeToolbar.tsx`
Fixed top-right toolbar.

- **Edit** — toggles `editMode`
- **Canvas / List** — switches `layoutMode`
- **Add Section** — opens SectionEditor with `section: null`
- **Reset positions** — re-grids Canvas sections (only when layout is canvas)

#### `src/components/editor/SectionEditor.tsx`
Dialog for create/edit section.

- **Fields:** Name, accent color (ColorPickerField)
- **Creates:** New section with `crypto.randomUUID()`, default position `{x:40, y:40}`

#### `src/components/editor/LinkEditor.tsx`
Dialog for create/edit link.

- **Fields:** URL, label, badge emoji (max 2 chars), badge color
- **Preview:** LinkCard
- **Delete:** Only when editing existing link

#### `src/components/editor/ColorPickerField.tsx`
Color input: native picker, hex input, swatches from `COLOR_SWATCHES`.

---

### Other

#### `src/components/EmptyState.tsx`
First-run view when no sections; prompts user to click Edit.

#### `src/components/theme-provider.tsx`
Theme context (dark/light/system), localStorage persistence, system preference listener.

---

## Lib Utilities

| File | Exports | Purpose |
|------|---------|---------|
| `src/lib/utils.ts` | `cn(...)` | `clsx` + `tailwind-merge` for class names |
| `src/lib/favicon.ts` | `getFaviconUrl(url, size?)` | Google favicon URL for domain |
| `src/lib/url.ts` | `getDomain(url)` | Hostname without `www.` |
| `src/lib/color-swatches.ts` | `COLOR_SWATCHES` | Preset hex colors for pickers |

---

## UI Components (shadcn)

- `src/components/ui/button.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/command.tsx` (cmdk)
- `src/components/ui/popover.tsx`
- `src/components/ui/input-group.tsx`
- `src/components/ui/textarea.tsx`

---

## Key Patterns

1. **State updates:** Prefer `save((prev) => ({ ...prev, ... }))` to avoid stale closures.
2. **Canvas drag:** Use `transform` from `useDraggable`, not `event.delta`, in scrollable containers.
3. **Positions:** `normalizePosition` and `migrateSections` ensure valid `{x,y}`; invalid values get grid fallback.
4. **Extension:** `chrome.storage.sync`; `base: "./"` in Vite for extension asset paths.

---

## File Tree (Relevant)

```
src/
├── App.tsx                 # Root, layout, dialogs
├── main.tsx
├── index.css
├── types/index.ts
├── hooks/
│   ├── useStorage.ts      # Chrome storage + state
│   └── useEscape.ts       # Escape key
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx
│   │   ├── SectionFrame.tsx
│   │   └── LinkCard.tsx
│   ├── list/
│   │   ├── ListView.tsx
│   │   └── SectionRow.tsx
│   ├── search/
│   │   └── CommandPalette.tsx
│   ├── editor/
│   │   ├── EditModeToolbar.tsx
│   │   ├── SectionEditor.tsx
│   │   ├── LinkEditor.tsx
│   │   └── ColorPickerField.tsx
│   ├── EmptyState.tsx
│   ├── theme-provider.tsx
│   └── ui/                # shadcn
└── lib/
    ├── utils.ts
    ├── favicon.ts
    ├── url.ts
    └── color-swatches.ts
```

---

## For AI Agents

- **State:** Single source in `useStorage`; `save` accepts object or updater.
- **Canvas drag:** Do not use `event.delta`; use `transform` from `useDraggable` via `onTransformChange`.
- **Adding features:** Follow existing patterns (updater form for `save`, `normalizePosition` for positions).
- **Debug logs:** `[Canvas]` and `[useStorage]` logs exist; remove when done.
- **Extension:** Load unpacked from `dist/` after `npm run build`; manifest at `public/manifest.json`.
