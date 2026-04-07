/// <reference types="chrome" />

const STORAGE_KEY = "bntDebug" as const

let runtimeDebug = false

function isBuildTimeDebugEnabled(): boolean {
  const viteDebug = (
    import.meta.env as { VITE_EXTENSION_DEBUG?: string }
  ).VITE_EXTENSION_DEBUG
  return import.meta.env.DEV || viteDebug === "true"
}

export function isExtensionDebugEnabled(): boolean {
  return isBuildTimeDebugEnabled() || runtimeDebug
}

/** Call once at startup; enables logs when `chrome.storage.local.bntDebug === true` (and on later changes). */
export function hydrateExtensionRuntimeDebugFromStorage(): void {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return

  const apply = (value: unknown) => {
    runtimeDebug = value === true
  }

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    if (chrome.runtime.lastError) return
    apply(result[STORAGE_KEY])
  })

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return
    const change = changes[STORAGE_KEY]
    if (change === undefined) return
    apply(change.newValue)
  })
}

export function extensionDebugLog(...args: unknown[]): void {
  if (!isExtensionDebugEnabled()) return
  console.log(...args)
}
