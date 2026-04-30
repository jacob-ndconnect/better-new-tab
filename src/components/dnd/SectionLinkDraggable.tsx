import type { ReactElement, ReactNode } from "react"
import { Children, Fragment, cloneElement, isValidElement, useCallback, useEffect, useRef } from "react"
import { useDndMonitor, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { LinkCard } from "@/components/canvas/LinkCard"
import { cn } from "@/lib/utils"
import type { Link } from "@/types"
import { sectionLinkDragId } from "./linkDragIds"

function injectLinkCardIsDragging(
  node: ReactNode,
  isDragging: boolean
): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child
    if (child.type === LinkCard) {
      return cloneElement(child as ReactElement<{ isDragging?: boolean }>, {
        isDragging,
      })
    }
    if (child.type === Fragment) {
      const p = child.props as { children?: ReactNode }
      return cloneElement(child, {
        children: injectLinkCardIsDragging(p.children, isDragging),
      } as never)
    }
    const p = child.props as { children?: ReactNode }
    if (p.children != null) {
      return cloneElement(child, {
        ...p,
        children: injectLinkCardIsDragging(p.children, isDragging),
      } as never)
    }
    return child
  })
}

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

  const child = enabled
    ? injectLinkCardIsDragging(children, isDragging)
    : children

  return (
    <div
      ref={setContainerRef}
      style={style}
      {...(enabled ? listeners : {})}
      {...(enabled ? attributes : {})}
      className={cn(
        "relative pr-2",
        enabled &&
          (isDragging ? "cursor-grabbing" : "cursor-grab touch-none"),
        enabled && isDragging && layout === "canvas" && "z-50 opacity-90",
        enabled && isDragging && layout === "list" && "opacity-40"
      )}
    >
      {child}
    </div>
  )
}
