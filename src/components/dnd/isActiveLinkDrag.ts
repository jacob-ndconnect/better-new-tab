import type { Active } from "@dnd-kit/core"
import {
  FLOATING_LINK_ID_PREFIX,
  SECTION_LINK_DRAG_PREFIX,
} from "./linkDragIds"

/** Uses drag id prefixes so we do not rely on `data.current` (and `useDroppable` supplies `active` with stable updates). */
export function isActiveLinkDrag(active: Active | null | undefined): boolean {
  if (!active) return false
  const id = String(active.id)
  return (
    id.startsWith(SECTION_LINK_DRAG_PREFIX) ||
    id.startsWith(FLOATING_LINK_ID_PREFIX)
  )
}

/** Section links only — not already-ungrouped floating links on the canvas. */
export function isActiveSectionLinkDrag(active: Active | null | undefined): boolean {
  if (!active) return false
  return String(active.id).startsWith(SECTION_LINK_DRAG_PREFIX)
}
