export type BadgeStyle = {
  emoji: string // e.g. "🚀" or text like "dev"
  color: string // hex color, e.g. "#FF4500"
}

export type Link = {
  id: string
  url: string
  label: string // custom display name
  searchTerms?: string // optional; used for CommandPalette search
  badge?: BadgeStyle // optional corner badge
  customIcon?: string // optional base64 or URL for custom icon (future)
}

export type StandaloneLinkEntry = {
  link: Link
  position: { x: number; y: number }
}

export type Section = {
  id: string
  name: string
  accentColor: string // hex color for section header/border
  links: Link[]
  // Canvas mode position
  position: { x: number; y: number }
  // Canvas mode size is auto — derived from number of links
}

export type SectionLabelSize =
  | "text-xs"
  | "text-sm"
  | "text-base"
  | "text-lg"
  | "text-xl"
  | "text-2xl"
  | "text-3xl"

export type Settings = {
  searchShortcut: string
  settingsShortcut: string
  sectionLabelSize: SectionLabelSize
}

/** Synthetic section id for list view / search grouping (not stored on canvas). */
export const UNGROUPED_SECTION_ID = "__ungrouped__"

export type AppState = {
  sections: Section[]
  standaloneLinks: StandaloneLinkEntry[]
  layoutMode: "canvas" | "list" | "folders"
  editMode: boolean
  settings: Settings
}
