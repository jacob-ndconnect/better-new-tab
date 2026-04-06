import { useDroppable } from "@dnd-kit/core"
import { DROP_STANDALONE_ID } from "@/components/dnd/linkDragIds"
import { isActiveLinkDrag } from "@/components/dnd/isActiveLinkDrag"
import { cn } from "@/lib/utils"

/** Full-bleed drop target behind sections so links can be moved to ungrouped (canvas). */
export function CanvasStandaloneDropLayer() {
  const { setNodeRef, isOver, active } = useDroppable({
    id: DROP_STANDALONE_ID,
    data: { kind: "canvas-standalone-drop" as const },
  })

  const showOverlay = isOver && isActiveLinkDrag(active)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "pointer-events-auto absolute inset-0 z-0",
        showOverlay && "bg-background/45"
      )}
      aria-hidden={!showOverlay}
    >
      {showOverlay ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <span className="rounded-lg border border-border bg-background/95 px-4 py-2 text-sm font-medium text-foreground shadow-md">
            Move outside sections
          </span>
        </div>
      ) : null}
    </div>
  )
}
