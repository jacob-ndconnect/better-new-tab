import {
  PencilIcon,
  PlusIcon,
  SquaresFourIcon,
  ListIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AppState } from "@/types"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { Kbd } from "../ui/kbd"
import GradualBlurMemo from "../GradualBlur"

const GRID_OFFSET = 40
const GRID_GAP = 20
const SECTION_WIDTH = 280
const SECTION_HEIGHT = 200

function resetSectionPositions(sections: AppState["sections"]) {
  return sections.map((section, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    return {
      ...section,
      position: {
        x: GRID_OFFSET + col * (SECTION_WIDTH + GRID_GAP),
        y: GRID_OFFSET + row * (SECTION_HEIGHT + GRID_GAP),
      },
    }
  })
}

type EditModeToolbarProps = {
  state: AppState
  save: (newStateOrUpdater: AppState | ((prev: AppState) => AppState)) => void
  onAddSection: () => void
  searchOpen: boolean
  onSearchClick: () => void
}

export function EditModeToolbar({
  state,
  save,
  onAddSection,
  searchOpen,
  onSearchClick,
}: EditModeToolbarProps) {
  const { editMode, layoutMode } = state

  const toggleEditMode = () => {
    save({ ...state, editMode: !editMode })
  }

  const setLayoutMode = (mode: "canvas" | "list") => {
    save({ ...state, layoutMode: mode })
  }

  return (
    <>
      <GradualBlurMemo
        className="top-0 right-0 left-0"
        position="top"
        strength={2}
        height="4rem"
        divCount={5}
        zIndex={0}
        style={{ right: "calc(100vw - 100%)" }}
      />
      <div
        className="fixed top-4 right-4 left-4 z-40 items-center justify-between gap-1 grid grid-cols-[1fr_auto_1fr]"
        aria-label="Edit mode toolbar"
      >
      

        <div className='flex justify-start'><div className="flex items-center rounded-full border border-border bg-background/95 shadow-sm backdrop-blur">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditMode}
          className={cn(
            "cursor-pointer gap-1.5 rounded-full",
            editMode && "bg-muted"
          )}
          aria-pressed={editMode}
        >
          <PencilIcon className="size-4" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
          {editMode && (
            <>
              <div className="h-5 w-px bg-border" aria-hidden />
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddSection}
                className="gap-1.5 rounded-l-none cursor-pointer"
              >
                <PlusIcon className="size-4" />
                <span className="hidden sm:inline">Add Section</span>
              </Button>
              {state.layoutMode === "canvas" && state.sections.length > 0 && (
                <>
                  <div className="h-5 w-px bg-border" aria-hidden />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      save((prev) => ({
                        ...prev,
                        sections: resetSectionPositions(prev.sections),
                      }))
                    }
                    className="rounded-l-none text-xs text-muted-foreground cursor-pointer"
                    title="Reset section positions to grid"
                  >
                    Reset positions
                  </Button>
                </>
              )}
            </>
          )}
        </div></div>


        <InputGroup
          className={cn(
            "f-full w-full max-w-sm cursor-pointer rounded-full",
            searchOpen && "opacity-2"
          )}
          onClick={onSearchClick}
        >
          <InputGroupInput placeholder="Search" />
          <InputGroupAddon>
            <MagnifyingGlassIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd className="rounded-full">Ctrk</Kbd>
            <Kbd className="rounded-full">K</Kbd>
          </InputGroupAddon>
        </InputGroup>

       <div className='flex justify-end'> <div className="flex items-center rounded-full border border-border bg-background/95 shadow-sm backdrop-blur">
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayoutMode("canvas")}
              className={cn(
                "cursor-pointer rounded-full border-0",
                layoutMode === "canvas" && "bg-muted"
              )}
              aria-pressed={layoutMode === "canvas"}
            >
              <SquaresFourIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayoutMode("list")}
              className={cn(
                "cursor-pointer rounded-full border-0",
                layoutMode === "list" && "bg-muted"
              )}
              aria-pressed={layoutMode === "list"}
            >
              <ListIcon className="size-4" />
            </Button>
          </div>
          {/* {editMode && (
            <>
              <div className="h-5 w-px bg-border" aria-hidden />
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddSection}
                className="gap-1.5 rounded-l-none"
              >
                <PlusIcon className="size-4" />
                <span className="hidden sm:inline">Add Section</span>
              </Button>
              {state.layoutMode === "canvas" && state.sections.length > 0 && (
                <>
                  <div className="h-5 w-px bg-border" aria-hidden />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      save((prev) => ({
                        ...prev,
                        sections: resetSectionPositions(prev.sections),
                      }))
                    }
                    className="rounded-l-none text-xs text-muted-foreground"
                    title="Reset section positions to grid"
                  >
                    Reset positions
                  </Button>
                </>
              )}
            </>
          )} */}
        </div></div>
      </div>
    </>
  )
}
