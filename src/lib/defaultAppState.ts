import type { AppState, Settings } from "@/types"

export const DEFAULT_SETTINGS: Settings = {
  searchShortcut: "Mod+K",
  settingsShortcut: "Mod+,",
  sectionLabelSize: "text-lg",
}

export const DEFAULT_APP_STATE: AppState = {
  sections: [],
  standaloneLinks: [],
  layoutMode: "canvas",
  editMode: false,
  settings: { ...DEFAULT_SETTINGS },
}
