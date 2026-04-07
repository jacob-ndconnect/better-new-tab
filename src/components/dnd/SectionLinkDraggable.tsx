import type { ReactNode } from "react"
import { useCallback, useEffect, useRef } from "react"
import { useDndMonitor, useDraggable } from "@dnd-kit/core"
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
  const dragId = sectionLinkDragId(sectionId, linkId)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const blockClickRef = useRef<((e: Event) => void) | null>(null)
  const cleanupTimerRef = useRef<number | null>(null)

  const removeBlockClickListener = useCallback(() => {
    if (cleanupTimerRef.current !== null) {
      window.clearTimeout(cleanupTimerRef.current)
      cleanupTimerRef.current = null
    }
    if (blockClickRef.current) {
      document.removeEventListener("click", blockClickRef.current, {
        capture: true,
      })
      blockClickRef.current = null
    }
  }, [])

  useDndMonitor({
    onDragStart(event) {
      if (event.active.id !== dragId) return
      removeBlockClickListener()
      const container = containerRef.current
      if (!container) return
      const blockClickFromDrag = (e: Event) => {
        if (!container.contains(e.target as Node)) return
        e.preventDefault()
        e.stopPropagation()
      }
      blockClickRef.current = blockClickFromDrag
      document.addEventListener("click", blockClickFromDrag, { capture: true })
    },
    onDragEnd(event) {
      if (event.active.id !== dragId) return
      if (cleanupTimerRef.current !== null) {
        window.clearTimeout(cleanupTimerRef.current)
      }
      cleanupTimerRef.current = window.setTimeout(() => {
        cleanupTimerRef.current = null
        removeBlockClickListener()
      }, 500)
    },
    onDragCancel(event) {
      if (event.active.id !== dragId) return
      removeBlockClickListener()
    },
  })

  useEffect(() => {
    return () => removeBlockClickListener()
  }, [removeBlockClickListener])

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId,
      data: {
        kind: "section-link" as const,
        sectionId,
        linkId,
        link,
      },
      disabled: !enabled,
    })

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node)
      containerRef.current = node
    },
    [setNodeRef]
  )

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setContainerRef}
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
