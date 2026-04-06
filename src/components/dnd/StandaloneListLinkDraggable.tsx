import type { ReactNode } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import type { Link } from "@/types"
import { floatingLinkDragId } from "./linkDragIds"

type StandaloneListLinkDraggableProps = {
  linkId: string
  link: Link
  editMode: boolean
  children: ReactNode
}

/** List view: ungrouped links use the same drag ids as canvas floating links. */
export function StandaloneListLinkDraggable({
  linkId,
  link,
  editMode,
  children,
}: StandaloneListLinkDraggableProps) {
  const enabled = editMode
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: floatingLinkDragId(linkId),
      data: { kind: "standalone" as const, linkId, link },
      disabled: !enabled,
    })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative shrink-0 pt-2 pr-2",
        enabled && isDragging && "opacity-40"
      )}
    >
      {enabled && (
        <div
          {...listeners}
          {...attributes}
          className={cn(
            "absolute -top-0.5 left-1/2 z-10 flex -translate-x-1/2 cursor-grab flex-col items-center gap-0.5 active:cursor-grabbing",
            "touch-none"
          )}
          aria-label="Drag link"
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
