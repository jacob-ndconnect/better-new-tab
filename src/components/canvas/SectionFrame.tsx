import { useCallback, useEffect, useRef, useState } from "react"
import { PlusIcon } from "@phosphor-icons/react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { LinkDropTargetOverlay } from "@/components/dnd/LinkDropTargetOverlay"
import { dropSectionDroppableId } from "@/components/dnd/linkDragIds"
import { isActiveLinkDrag } from "@/components/dnd/isActiveLinkDrag"
import { SectionLinkDraggable } from "@/components/dnd/SectionLinkDraggable"
import { LinkCard } from "./LinkCard"
import { getContrastColor } from "@/lib/color"
import {
  canvasColumnSpanFromTargetWidth,
  effectiveCanvasColumnSpan,
  maxCanvasColumnSpanForSection,
  readHorizontalBorderPx,
  readHorizontalPaddingPx,
  SECTION_FRAME_OUTER_PADDING_X,
  SECTION_LINKS_INNER_PADDING_X,
  SECTION_LINKS_BORDER_X,
  sectionFrameOuterWidthPx,
} from "@/lib/canvasGrid"
import { sectionResizeDebugLog } from "@/lib/extensionDebugLog"
import { cn } from "@/lib/utils"
import type { Section, SectionLabelSize } from "@/types"
import { PencilIcon } from "@phosphor-icons/react/dist/ssr"

type SectionFrameProps = {
  section: Section
  editMode: boolean
  isDraggable: boolean
  sectionLabelSize?: SectionLabelSize
  onEditSection: () => void
  onEditLink: (linkId: string) => void
  onAddLink?: () => void
  /** Snap-to-grid horizontal resize (canvas column count), edit mode only. */
  onCanvasColumnSpanChange?: (columnSpan: number) => void
  onDragEnd: (id: string, newPosition: { x: number; y: number }) => void
  onTransformChange?: (
    id: string,
    transform: { x: number; y: number } | null
  ) => void
}

const DEFAULT_POSITION = { x: 40, y: 40 }

export function SectionFrame({
  section,
  editMode,
  isDraggable,
  sectionLabelSize = "text-lg",
  onEditSection,
  onEditLink,
  onAddLink,
  onCanvasColumnSpanChange,
  onTransformChange,
}: SectionFrameProps) {
  const position = section.position ?? DEFAULT_POSITION

  const [resizePreviewSpan, setResizePreviewSpan] = useState<number | null>(null)
  const resizeDragRef = useRef<{
    pointerId: number
    startClientX: number
    /** Link-row inner width (outer RR width − outer pad − links pad) at pointerdown. */
    startTileInner: number
    linkCap: number
  } | null>(null)
  const lastResizeSpanRef = useRef<number | null>(null)
  const lastResizeLoggedSpanRef = useRef<number | null>(null)
  const frameOuterElRef = useRef<HTMLDivElement | null>(null)

  const columnSpan =
    resizePreviewSpan ?? effectiveCanvasColumnSpan(section)
  const frameWidthPx = sectionFrameOuterWidthPx(columnSpan)

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: section.id,
      data: { kind: "section" as const, section },
      disabled: !isDraggable,
    })

  const setFrameOuterRef = useCallback(
    (el: HTMLDivElement | null) => {
      frameOuterElRef.current = el
      setNodeRef(el)
    },
    [setNodeRef]
  )

  const {
    setNodeRef: setLinksDropRef,
    isOver: isDropOverLinks,
    active: dropContextActive,
  } = useDroppable({
    id: dropSectionDroppableId(section.id),
    data: { kind: "section-drop" as const, sectionId: section.id },
  })

  const linksPanelElRef = useRef<HTMLDivElement | null>(null)
  const setLinksPanelRef = useCallback(
    (el: HTMLDivElement | null) => {
      linksPanelElRef.current = el
      setLinksDropRef(el)
    },
    [setLinksDropRef]
  )

  const linkDropTargetActive =
    isDropOverLinks && isActiveLinkDrag(dropContextActive)

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const [isCardHovered, setIsCardHovered] = useState(false)

  useEffect(() => {
    onTransformChange?.(section.id, transform ?? null)
  }, [section.id, transform, onTransformChange])

  const endResizeGesture = (
    target: HTMLElement,
    pointerId: number,
    commit: boolean
  ) => {
    const session = resizeDragRef.current
    if (!session || session.pointerId !== pointerId) return
    resizeDragRef.current = null
    try {
      target.releasePointerCapture(pointerId)
    } catch {
      // already released
    }
    const finalSpan = lastResizeSpanRef.current
    lastResizeSpanRef.current = null
    setResizePreviewSpan(null)
    if (
      commit &&
      finalSpan !== null &&
      finalSpan !== effectiveCanvasColumnSpan(section)
    ) {
      onCanvasColumnSpanChange?.(finalSpan)
    }
  }

  return (
    <div
      ref={setFrameOuterRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: frameWidthPx,
        maxWidth: frameWidthPx,
        minWidth: 0,
        borderColor: section.accentColor,
        ...style,
      }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className={cn(
        "group relative z-1 flex min-w-0 shrink-0 flex-col gap-0 rounded-2xl p-4 shadow-sm",
        isDraggable && !isDragging && "hover:bg-white/5 hover:backdrop-blur-sm",
        isDraggable && isDragging && "cursor-grabbing",
        isDragging && "z-50 bg-white/10 shadow-lg backdrop-blur-sm"
      )}
    >
      {isDraggable && (
        <div
          {...(isDraggable ? { ...attributes, ...listeners } : {})}
          className={cn(
            "absolute top-2 left-1/2 z-10 flex -translate-x-1/2 cursor-grab flex-col items-center gap-0.5 transition-opacity",
            "after:absolute after:top-1/2 after:left-1/2 after:h-10 after:w-12 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
            isDragging && "cursor-grabbing",
            !editMode && !isCardHovered && "opacity-0",
            !editMode && isCardHovered && "opacity-100"
          )}
          aria-label="Drag section"
        >
          {[1, 2].map((i) => (
            <span
              key={i}
              className="h-[2px] w-5 rounded-full bg-muted-foreground/50"
            />
          ))}
        </div>
      )}
      <div className="group flex min-w-0 items-center justify-between gap-2 pb-2">
        <h3
          className={cn(
            "min-w-0 max-w-full truncate rounded-full px-2 font-semibold",
            sectionLabelSize
          )}
          style={{
            backgroundColor: section.accentColor,
            color: getContrastColor(section.accentColor),
          }}
        >
          {section.name}
        </h3>
        <div className="flex shrink-0 items-center gap-0.5">
          {onAddLink && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAddLink()
              }}
              className={cn(
                "cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                !editMode &&
                  "opacity-0 transition-opacity group-hover:opacity-100"
              )}
              aria-label="Add link"
            >
              <PlusIcon className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEditSection()
            }}
            className={cn(
              "cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              !editMode &&
                "opacity-0 transition-opacity group-hover:opacity-100"
            )}
            aria-label="Edit section"
          >
            <PencilIcon className="size-5" />
          </button>
        </div>
      </div>

      <div
        ref={setLinksPanelRef}
        className="relative grid min-h-0 min-w-0 auto-rows-max gap-4 overflow-visible rounded-md border border-border bg-background/60 p-4 backdrop-blur-sm"
        style={{
          borderColor: section.accentColor,
          gridTemplateColumns: `repeat(${columnSpan}, max-content)`,
        }}
      >
        <LinkDropTargetOverlay
          visible={linkDropTargetActive}
          message="Move to this section"
        />
        {section.links.map((link) => (
          <SectionLinkDraggable
            key={link.id}
            sectionId={section.id}
            linkId={link.id}
            link={link}
            editMode={editMode}
          >
            <LinkCard
              link={link}
              editMode={editMode}
              onEdit={() => onEditLink(link.id)}
            />
          </SectionLinkDraggable>
        ))}
        {/* {editMode && onAddLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddLink()
            }}
            className="flex size-[88px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
          >
            <PlusIcon className="size-6" />
            <span className="text-xs">Add Link</span>
          </button>
        )} */}

        {editMode && onCanvasColumnSpanChange && (
          <button
            type="button"
            aria-label="Resize section width"
            className="absolute right-0 bottom-0 z-40 size-7 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border-2 border-background shadow-md ring-2 ring-background/90 touch-none"
            style={{ backgroundColor: section.accentColor }}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const linkCap = maxCanvasColumnSpanForSection(section)
              const outer = frameOuterElRef.current
              const links = linksPanelElRef.current
              const pOut =
                outer != null
                  ? readHorizontalPaddingPx(outer, SECTION_FRAME_OUTER_PADDING_X)
                  : SECTION_FRAME_OUTER_PADDING_X
              const pLinks =
                links != null
                  ? readHorizontalPaddingPx(
                      links,
                      SECTION_LINKS_INNER_PADDING_X
                    )
                  : SECTION_LINKS_INNER_PADDING_X
              const bLinks =
                links != null
                  ? readHorizontalBorderPx(links)
                  : SECTION_LINKS_BORDER_X
              const outerW =
                outer?.getBoundingClientRect().width ??
                sectionFrameOuterWidthPx(effectiveCanvasColumnSpan(section))
              const startTileInner = outerW - pOut - pLinks - bLinks
              const startSpan = canvasColumnSpanFromTargetWidth(
                startTileInner,
                linkCap
              )
              resizeDragRef.current = {
                pointerId: e.pointerId,
                startClientX: e.clientX,
                startTileInner,
                linkCap,
              }
              lastResizeSpanRef.current = startSpan
              lastResizeLoggedSpanRef.current = null
              setResizePreviewSpan(startSpan)
              sectionResizeDebugLog({
                event: "resizePointerDown",
                sectionId: section.id,
                linkCount: section.links.length,
                linkCap,
                outerPaddingPx: pOut,
                linksPaddingPx: pLinks,
                linksBorderPx: bLinks,
                outerWidth: outerW,
                tileInnerWidth: startTileInner,
                startSpan,
                storedCanvasColumnSpan: section.canvasColumnSpan ?? null,
                effectiveSpan: effectiveCanvasColumnSpan(section),
              })
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const session = resizeDragRef.current
              if (!session || e.pointerId !== session.pointerId) return
              const delta = e.clientX - session.startClientX
              const targetTileInner = session.startTileInner + delta
              const next = canvasColumnSpanFromTargetWidth(
                targetTileInner,
                session.linkCap
              )
              lastResizeSpanRef.current = next
              setResizePreviewSpan(next)
              if (next !== lastResizeLoggedSpanRef.current) {
                lastResizeLoggedSpanRef.current = next
                sectionResizeDebugLog({
                  event: "resizePointerMove",
                  sectionId: section.id,
                  targetTileInner,
                  span: next,
                  linkCap: session.linkCap,
                  delta,
                })
              }
            }}
            onPointerUp={(e) => {
              endResizeGesture(e.currentTarget, e.pointerId, true)
            }}
            onPointerCancel={(e) => {
              endResizeGesture(e.currentTarget, e.pointerId, false)
            }}
          />
        )}
      </div>
    </div>
  )
}
