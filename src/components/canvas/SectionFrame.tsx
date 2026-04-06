import { useEffect, useState } from "react"
import { PlusIcon } from "@phosphor-icons/react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { LinkCard } from "./LinkCard"
import { getContrastColor } from "@/lib/color"
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
  onTransformChange,
}: SectionFrameProps) {
  const position = section.position ?? DEFAULT_POSITION

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: section.id,
      data: { kind: "section" as const, section },
      disabled: !isDraggable,
    })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const [isCardHovered, setIsCardHovered] = useState(false)

  useEffect(() => {
    onTransformChange?.(section.id, transform ?? null)
  }, [section.id, transform, onTransformChange])

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        // borderLeftColor: section.accentColor,
        borderColor: section.accentColor,
        ...style,
      }}
      {...(isDraggable ? { ...attributes, ...listeners } : {})}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className={cn(
        "group relative flex min-w-[200px] flex-col gap-0 rounded-2xl p-4 shadow-sm",
        isDraggable && "cursor-grab active:cursor-grabbing",
        isDraggable && !isDragging && "hover:bg-white/5 hover:backdrop-blur-sm",
        isDragging && "z-50 bg-white/10 shadow-lg backdrop-blur-sm"
      )}
    >
      {isDraggable && (
        <div
          className={cn(
            "pointer-events-none absolute top-2 left-1/2 -my-1 flex -translate-x-1/2 flex-col items-center gap-0.5 transition-opacity",
            !editMode && !isCardHovered && "opacity-0",
            !editMode && isCardHovered && "opacity-100"
          )}
          aria-hidden
        >
          {[1, 2].map((i) => (
            <span
              key={i}
              className="h-[2px] w-5 rounded-full bg-muted-foreground/50"
            />
          ))}
        </div>
      )}
      <div className="group flex items-center justify-between gap-2 pb-2">
        <h3
          className={cn(
            "shrink-0 rounded-full px-2 font-semibold whitespace-nowrap",
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
        className="flex flex-wrap gap-4 overflow-visible rounded-md border border-border bg-background/60 p-4 backdrop-blur-sm"
        style={{
          borderColor: section.accentColor,
        }}
      >
        {section.links.map((link) => (
          <div key={link.id} className="pt-2 pr-2">
            <LinkCard
              key={link.id}
              link={link}
              editMode={editMode}
              onEdit={() => onEditLink(link.id)}
            />
          </div>
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
      </div>
    </div>
  )
}
