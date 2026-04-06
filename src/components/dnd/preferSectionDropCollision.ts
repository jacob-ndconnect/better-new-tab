import {
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core"
import { DROP_SECTION_PREFIX } from "./linkDragIds"

/** Prefer a section link strip over the full-canvas standalone drop zone. */
export const preferSectionOverStandalone: CollisionDetection = (args) => {
  const collisions = pointerWithin(args)
  const sectionHits = collisions.filter((c) =>
    String(c.id).startsWith(DROP_SECTION_PREFIX)
  )
  if (sectionHits.length > 0) return sectionHits
  return collisions
}
