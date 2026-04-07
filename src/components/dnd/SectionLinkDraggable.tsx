import type { ReactNode } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import type { Link } from "@/types"
import { sectionLinkDragId } from "./linkDragIds"

type SectionLinkDraggableProps = {
  sectionId: string
  linkId: string
  link: Link
  editMode: boolean
  /** List layout uses a portal overlay; dim the in-flow copy while dragging. */
  layout?: "canvas" | "list"
  children: ReactNode
}

export function SectionLinkDraggable({
  sectionId,
  linkId,
  link,
  editMode,
  layout = "canvas",
  children,
}: SectionLinkDraggableProps) {
  const enabled = editMode
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: sectionLinkDragId(sectionId, linkId),
      data: {
        kind: "section-link" as const,
        sectionId,
        linkId,
        link,
      },
      disabled: !enabled,
    })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enabled ? listeners : {})}
      {...(enabled ? attributes : {})}
      className={cn(
        "relative pt-2 pr-2",
        enabled && "cursor-grab touch-none active:cursor-grabbing",
        enabled && isDragging && layout === "canvas" && "z-50 opacity-90",
        enabled && isDragging && layout === "list" && "opacity-40"
      )}
    >
      {enabled && (
        <div
          className="pointer-events-none absolute -top-0.5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0.5"
          aria-hidden
        >
          {[1, 2].map((i) => (
            <span
              key={i}
              className="h-[2px] w-5 rounded-full bg-muted-foreground/60"
            />
          ))}
        </div>
      )}
      {children}
    </div>
  )
}
