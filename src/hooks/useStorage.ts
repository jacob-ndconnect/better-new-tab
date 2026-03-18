/// <reference types="chrome"/>

import { useRef, useState, useEffect } from "react"
import type { AppState, Section } from "../types"

const DEFAULT_SETTINGS = {
  searchShortcut: "Mod+K",
} as const

const DEFAULT_STATE: AppState = {
  sections: [],
  layoutMode: "canvas",
  editMode: false,
  settings: { ...DEFAULT_SETTINGS },
}

const STORAGE_KEY = "appState"

function isValidPosition(pos: unknown): pos is { x: number; y: number } {
  return (
    pos != null &&
    typeof pos === "object" &&
    typeof (pos as { x?: number }).x === "number" &&
    typeof (pos as { y?: number }).y === "number" &&
    !Number.isNaN((pos as { x: number }).x) &&
    !Number.isNaN((pos as { y: number }).y) &&
    (pos as { x: number }).x >= 0 &&
    (pos as { y: number }).y >= 0 &&
    (pos as { x: number }).x < 10000 &&
    (pos as { y: number }).y < 10000
  )
}

function migrateSections(sections: Section[]): Section[] {
  const GRID_OFFSET = 40
  const GRID_GAP = 20
  const SECTION_WIDTH = 280
  const SECTION_HEIGHT = 200

  return sections.map((section, index) => {
    if (isValidPosition(section.position)) {
      return section
    }
    const col = index % 3
    const row = Math.floor(index / 3)
    const position = {
      x: GRID_OFFSET + col * (SECTION_WIDTH + GRID_GAP),
      y: GRID_OFFSET + row * (SECTION_HEIGHT + GRID_GAP),
    }
    return { ...section, position }
  })
}

export function useStorage() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)
  const hasUserSavedRef = useRef(false)

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      if (hasUserSavedRef.current) return
      let appState = result[STORAGE_KEY] as AppState | undefined
      if (appState?.sections?.length) {
        const migrated = migrateSections(appState.sections)
        const needsSave = migrated.some((_, i) =>
          !isValidPosition(appState!.sections[i]?.position)
        )
        appState = { ...appState, sections: migrated }
        if (needsSave) chrome.storage.sync.set({ [STORAGE_KEY]: appState })
      }
      if (!appState?.settings) {
        appState = {
          ...appState,
          settings: { ...DEFAULT_SETTINGS, ...appState?.settings },
        }
        chrome.storage.sync.set({ [STORAGE_KEY]: appState })
      }
      if (appState) setState(appState)
      setLoaded(true)
    })
  }, [])

  const save = (newStateOrUpdater: AppState | ((prev: AppState) => AppState)) => {
    hasUserSavedRef.current = true
    setState((prev) => {
      const newState =
        typeof newStateOrUpdater === "function"
          ? newStateOrUpdater(prev)
          : newStateOrUpdater
      console.log("[useStorage] save", {
        sectionsCount: newState.sections.length,
        sections: newState.sections.map((s) => ({
          id: s.id,
          name: s.name,
          position: s.position,
        })),
      })
      queueMicrotask(() => {
        chrome.storage.sync.set({ [STORAGE_KEY]: newState })
      })
      return newState
    })
  }

  return { state, save, loaded }
}
