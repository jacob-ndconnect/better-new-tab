/// <reference types="chrome" />

export const CANVAS_SCROLL_ANCHOR_STORAGE_KEY = "canvasScrollAnchor"

export type CanvasScrollAnchor = {
  centerX: number
  centerY: number
}

export function parseCanvasScrollAnchor(
  raw: unknown
): CanvasScrollAnchor | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const { centerX, centerY } = o
  if (typeof centerX !== "number" || typeof centerY !== "number") return null
  if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) return null
  return { centerX, centerY }
}

function getFromArea(
  area: "local" | "sync"
): Promise<CanvasScrollAnchor | null> {
  return new Promise((resolve) => {
    chrome.storage[area].get(CANVAS_SCROLL_ANCHOR_STORAGE_KEY, (result) => {
      const parsed = parseCanvasScrollAnchor(
        result[CANVAS_SCROLL_ANCHOR_STORAGE_KEY]
      )
      resolve(parsed)
    })
  })
}

/** When preferSync is true, try sync first, then fall back to local. Otherwise local only. */
export function readCanvasScrollAnchor(
  preferSync: boolean
): Promise<CanvasScrollAnchor | null> {
  if (preferSync) {
    return getFromArea("sync").then((sync) => sync ?? getFromArea("local"))
  }
  return getFromArea("local")
}

/** Always writes local; mirrors to sync when useSync is true. */
export function writeCanvasScrollAnchor(
  anchor: CanvasScrollAnchor,
  useSync: boolean
): void {
  const payload = { [CANVAS_SCROLL_ANCHOR_STORAGE_KEY]: anchor }
  chrome.storage.local.set(payload)
  if (useSync) {
    chrome.storage.sync.set(payload)
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Place the given content-space point at the viewport center (clamped). */
export function applyScrollToCenter(
  el: HTMLElement,
  centerX: number,
  centerY: number
): void {
  const maxL = Math.max(0, el.scrollWidth - el.clientWidth)
  const maxT = Math.max(0, el.scrollHeight - el.clientHeight)
  el.scrollLeft = clamp(centerX - el.clientWidth / 2, 0, maxL)
  el.scrollTop = clamp(centerY - el.clientHeight / 2, 0, maxT)
}

export function viewportCenterInContentSpace(el: HTMLElement): CanvasScrollAnchor {
  return {
    centerX: el.scrollLeft + el.clientWidth / 2,
    centerY: el.scrollTop + el.clientHeight / 2,
  }
}
