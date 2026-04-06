import type { DragEndEvent } from "@dnd-kit/core"
import type { AppState } from "@/types"
import { UNGROUPED_SECTION_ID } from "@/types"
import {
  FLOATING_LINK_ID_PREFIX,
  parseSectionLinkDragId,
  targetSectionIdFromDropOver,
} from "@/components/dnd/linkDragIds"
import { moveLinkInState } from "./linkMove"

export type ApplyLinkDragEndOptions = {
  /** Set when dropping on the canvas `drop-standalone` zone so ungrouped links land under the cursor. */
  standaloneCanvasDropPosition?: { x: number; y: number }
}

/**
 * If the drag operation was a link reparenting (section ↔ section, or ↔ ungrouped), returns the next state.
 * Otherwise returns null so the caller can handle section / floating position drags.
 */
export function applyLinkDragEnd(
  event: DragEndEvent,
  prev: AppState,
  options?: ApplyLinkDragEndOptions
): AppState | null {
  const { active, over } = event
  if (!over) return null

  const overId = String(over.id)
  const toSectionId = targetSectionIdFromDropOver(overId)
  if (!toSectionId) return null

  const standalonePosition =
    toSectionId === UNGROUPED_SECTION_ID
      ? options?.standaloneCanvasDropPosition
      : undefined

  const activeStr = String(active.id)

  const sectionLink = parseSectionLinkDragId(activeStr)
  if (sectionLink) {
    return moveLinkInState(
      prev,
      sectionLink.linkId,
      { kind: "section", sectionId: sectionLink.sectionId },
      { kind: "section", sectionId: toSectionId },
      standalonePosition !== undefined
        ? { standalonePosition }
        : undefined
    )
  }

  if (activeStr.startsWith(FLOATING_LINK_ID_PREFIX)) {
    const linkId = activeStr.slice(FLOATING_LINK_ID_PREFIX.length)
    return moveLinkInState(
      prev,
      linkId,
      { kind: "section", sectionId: UNGROUPED_SECTION_ID },
      { kind: "section", sectionId: toSectionId },
      standalonePosition !== undefined
        ? { standalonePosition }
        : undefined
    )
  }

  return null
}
