import { useCallback, useRef } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { SectionFrame } from "./SectionFrame"
import { cn } from "@/lib/utils"
import type { AppState, Section } from "@/types"

type CanvasProps = {
  state: AppState
  save: (newStateOrUpdater: AppState | ((prev: AppState) => AppState)) => void
  onEditSection: (section: Section) => void
  onEditLink: (sectionId: string, linkId: string) => void
  onAddLink: (sectionId: string) => void
}

const DEFAULT_POSITION = { x: 40, y: 40 }
const GRID_GAP = 20
const SECTION_WIDTH = 280
const SECTION_HEIGHT = 200

function normalizePosition(
  pos: { x: number; y: number } | undefined,
  index: number
): { x: number; y: number } {
  if (
    pos &&
    typeof pos.x === "number" &&
    typeof pos.y === "number" &&
    !Number.isNaN(pos.x) &&
    !Number.isNaN(pos.y) &&
    pos.x >= 0 &&
    pos.y >= 0 &&
    pos.x < 10000 &&
    pos.y < 10000
  ) {
    return pos
  }
  const col = index % 3
  const row = Math.floor(index / 3)
  return {
    x: 40 + col * (SECTION_WIDTH + GRID_GAP),
    y: 40 + row * (SECTION_HEIGHT + GRID_GAP),
  }
}

export function Canvas({ state, save, onEditSection, onEditLink, onAddLink }: CanvasProps) {
  const { sections, editMode } = state
  const sectionsWithPosition = sections.map((s, i) => ({
    ...s,
    position: normalizePosition(s.position, i),
  }))
  const transformRef = useRef<{ x: number; y: number } | null>(null)
  const startPositionRef = useRef<{ x: number; y: number } | null>(null)

  const handleTransformChange = useCallback(
    (_id: string, transform: { x: number; y: number } | null) => {
      if (transform) transformRef.current = transform
    },
    []
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (event: import("@dnd-kit/core").DragStartEvent) => {
    transformRef.current = null
    const section = sectionsWithPosition.find((s) => s.id === event.active.id)
    const pos = section?.position ?? DEFAULT_POSITION
    startPositionRef.current = { x: pos.x, y: pos.y }
    console.log("[Canvas] dragStart", {
      activeId: event.active.id,
      section: section?.name,
      startPos: startPositionRef.current,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const startPos = startPositionRef.current
    startPositionRef.current = null
    const transform = transformRef.current
    transformRef.current = null

    console.log("[Canvas] dragEnd", {
      activeId: event.active.id,
      startPos,
      transform,
      sectionsCount: sectionsWithPosition.length,
    })

    if (!startPos || !transform) return

    const newPosition = {
      x: Math.max(0, startPos.x + transform.x),
      y: Math.max(0, startPos.y + transform.y),
    }

    save((prev) => {
      const newSections = prev.sections.map((s, i) => {
        const pos = normalizePosition(s.position, i)
        const isActive = s.id === event.active.id
        return {
          ...s,
          position: isActive ? newPosition : pos,
        }
      })

      console.log("[Canvas] saving", {
        newPosition,
        newSectionsCount: newSections.length,
        newSections: newSections.map((s) => ({
          id: s.id,
          name: s.name,
          position: s.position,
        })),
      })

      return { ...prev, sections: newSections }
    })

  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "absolute inset-0 overflow-auto scrollbar-none",
          editMode && "canvas-grid"
        )}
      >

        <div
          className="relative"
          style={{
            minHeight: "max(100vh, 1200px)",
            minWidth: "max(100vw, 1200px)",
          }}
        >
          {sectionsWithPosition.map((section) => (
            <SectionFrame
              key={section.id}
              section={section}
              editMode={editMode}
              onEditSection={() => onEditSection(section)}
              onEditLink={(linkId) => onEditLink(section.id, linkId)}
              onAddLink={() => onAddLink(section.id)}
              onDragEnd={() => {}}
              onTransformChange={handleTransformChange}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}
