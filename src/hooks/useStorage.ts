/// <reference types="chrome"/>

import { useRef, useState, useEffect } from "react"
import type { AppState, Section } from "../types"
import { APP_STATE_STORAGE_KEY } from "@/lib/appStateStorageKey"
import { DEFAULT_APP_STATE, DEFAULT_SETTINGS } from "@/lib/defaultAppState"

const DEFAULT_STATE: AppState = DEFAULT_APP_STATE

function normalizeLayoutMode(mode: unknown): AppState["layoutMode"] {
  if (mode === "canvas" || mode === "list" || mode === "folders") return mode
  return "canvas"
}

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

/** Normalize payload from sync (initial load, storage.onChanged, background pin). */
function normalizeStoredState(appState: AppState): AppState {
  const sections =
    appState.sections?.length > 0
      ? migrateSections(appState.sections)
      : (appState.sections ?? [])
  return {
    ...appState,
    sections,
    layoutMode: normalizeLayoutMode(appState.layoutMode),
    settings: { ...DEFAULT_SETTINGS, ...appState.settings },
    standaloneLinks: appState.standaloneLinks ?? [],
    editMode: appState.editMode === true,
  }
}

export function useStorage() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)
  const hasUserSavedRef = useRef(false)

  useEffect(() => {
    chrome.storage.sync.get(APP_STATE_STORAGE_KEY, (result) => {
      if (hasUserSavedRef.current) return
      let appState = result[APP_STATE_STORAGE_KEY] as AppState | undefined
      if (appState?.sections?.length) {
        const migrated = migrateSections(appState.sections)
        const needsSave = migrated.some((_, i) =>
          !isValidPosition(appState!.sections[i]?.position)
        )
        appState = { ...appState, sections: migrated }
        if (needsSave) chrome.storage.sync.set({ [APP_STATE_STORAGE_KEY]: appState })
      }
      if (appState) {
        const storedSettings = appState.settings
        const mergedSettings = { ...DEFAULT_SETTINGS, ...storedSettings }
        const needsPersistSettings =
          !storedSettings ||
          (Object.keys(DEFAULT_SETTINGS) as (keyof typeof DEFAULT_SETTINGS)[]).some(
            (k) => !(k in (storedSettings ?? {}))
          )
        const mergedStandalone = appState.standaloneLinks ?? []
        const needsPersistStandalone = appState.standaloneLinks === undefined
        const layoutMode = normalizeLayoutMode(appState.layoutMode)
        const needsPersistLayout = layoutMode !== appState.layoutMode
        appState = {
          ...appState,
          layoutMode,
          settings: mergedSettings,
          standaloneLinks: mergedStandalone,
        }
        if (needsPersistSettings || needsPersistStandalone || needsPersistLayout) {
          chrome.storage.sync.set({ [APP_STATE_STORAGE_KEY]: appState })
        }
      }
      if (appState) setState(normalizeStoredState(appState))
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    const onSync = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area !== "sync") return
      const change = changes[APP_STATE_STORAGE_KEY]
      if (change?.newValue === undefined) return
      setState(normalizeStoredState(change.newValue as AppState))
      setLoaded(true)
    }
    chrome.storage.onChanged.addListener(onSync)
    return () => chrome.storage.onChanged.removeListener(onSync)
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
        standaloneCount: newState.standaloneLinks.length,
        sections: newState.sections.map((s) => ({
          id: s.id,
          name: s.name,
          position: s.position,
        })),
      })
      queueMicrotask(() => {
        chrome.storage.sync.set({ [APP_STATE_STORAGE_KEY]: newState })
      })
      return newState
    })
  }

  return { state, save, loaded }
}
