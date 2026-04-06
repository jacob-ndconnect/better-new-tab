import type { ClientRect } from "@dnd-kit/core"

/** Map the dragged node's translated viewport rect to coordinates inside the canvas placement root. */
export function standalonePositionFromTranslatedRect(
  translated: ClientRect,
  placementRoot: HTMLElement
): { x: number; y: number } {
  const rootRect = placementRoot.getBoundingClientRect()
  const x = translated.left - rootRect.left
  const y = translated.top - rootRect.top
  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
  }
}
