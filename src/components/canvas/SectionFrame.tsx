import { useEffect } from "react"
import { PlusIcon } from "@phosphor-icons/react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { LinkCard } from "./LinkCard"
import { getContrastColor } from "@/lib/color"
import { cn } from "@/lib/utils"
import type { Section } from "@/types"
import { PencilIcon } from "@phosphor-icons/react/dist/ssr"

type SectionFrameProps = {
  section: Section
  editMode: boolean
  isDraggable: boolean
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
  onEditSection,
  onEditLink,
  onAddLink,
  onTransformChange,
}: SectionFrameProps) {
  const position = section.position ?? DEFAULT_POSITION

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: section.id,
      data: { section },
      disabled: !isDraggable,
    })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

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
      className={cn(
        "flex min-w-[200px] flex-col gap-3 p-4 shadow-sm",
        isDraggable && "cursor-grab active:cursor-grabbing",
        isDragging && "z-50 opacity-90 shadow-lg",
        `bg-[${section.accentColor}]/10`
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3
          className="rounded-md px-2 text-lg font-semibold"
          style={{
            backgroundColor: section.accentColor,
            color: getContrastColor(section.accentColor),
          }}
        >
          {section.name}
        </h3>
        {editMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEditSection()
            }}
            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Edit section"
          >
            <PencilIcon className="size-4" />
          </button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-4 overflow-visible border border-border p-4"
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
        {editMode && onAddLink && (
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
        )}
      </div>
    </div>
  )
}
