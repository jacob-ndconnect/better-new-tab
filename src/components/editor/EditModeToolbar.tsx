import {
  FoldersIcon,
  PencilIcon,
  SquaresFourIcon,
  ListIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AppState } from "@/types"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import {
  ArrowClockwiseIcon,
  FloppyDiskIcon,
  GearIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  SelectionPlusIcon,
} from "@phosphor-icons/react/dist/ssr"
import { formatForDisplay } from "@tanstack/react-hotkeys"
import { Kbd } from "../ui/kbd"
import GradualBlurMemo from "../GradualBlur"
import { getDefaultCanvasSectionPosition } from "@/lib/canvasGrid"

function hasCustomLayout(sections: AppState["sections"]): boolean {
  const tolerance = 2
  return sections.some((section, index) => {
    const def = getDefaultCanvasSectionPosition(index)
    const pos = section.position
    return (
      Math.abs(pos.x - def.x) > tolerance || Math.abs(pos.y - def.y) > tolerance
    )
  })
}

function resetSectionPositions(sections: AppState["sections"]) {
  return sections.map((section, index) => ({
    ...section,
    position: getDefaultCanvasSectionPosition(index),
  }))
}

type EditModeToolbarProps = {
  state: AppState
  save: (newStateOrUpdater: AppState | ((prev: AppState) => AppState)) => void
  onAddSection: () => void
  onAddStandaloneLink: () => void
  searchOpen: boolean
  onSearchClick: () => void
  onSettingsClick: () => void
}

export function EditModeToolbar({
  state,
  save,
  onAddSection,
  onAddStandaloneLink,
  searchOpen,
  onSearchClick,
  onSettingsClick,
}: EditModeToolbarProps) {
  const { editMode, layoutMode } = state

  const toggleEditMode = () => {
    save({ ...state, editMode: !editMode })
  }

  const setLayoutMode = (mode: AppState["layoutMode"]) => {
    save({ ...state, layoutMode: mode })
  }

  return (
    <>
      <GradualBlurMemo
        className="top-0 right-0 left-0"
        position="top"
        strength={0.5}
        height="4rem"
        divCount={5}
        zIndex={0}
        style={{ right: "calc(100vw - 100%)" }}
      />
      <div
        className="fixed top-4 right-4 left-4 z-40 grid grid-cols-[1fr_auto_1fr] items-center justify-between gap-1"
        aria-label="Edit mode toolbar"
      >
        <div className="flex justify-start">
          <div className="flex items-center rounded-full border border-border bg-background/95 shadow-sm backdrop-blur">
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
              {editMode ? (
                <FloppyDiskIcon className="size-4" />
              ) : (
                <PencilIcon className="size-4" />
              )}
              <span className="hidden sm:inline">
                {editMode ? "Save" : "Edit"}
              </span>
            </Button>
          </div>
        </div>

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
            {formatForDisplay(state.settings.searchShortcut)
              .split("+")
              .map((part) => (
                <Kbd
                  key={part}
                  className="rounded-lg bg-muted text-muted-foreground"
                >
                  {part}
                </Kbd>
              ))}
          </InputGroupAddon>
        </InputGroup>

        <div className="flex justify-end">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="cursor-pointer rounded-full"
              aria-label="Open settings"
            >
              <GearIcon className="size-4" weight="regular" />
            </Button>
            <div className="flex items-center rounded-full border border-border bg-background/95 shadow-sm backdrop-blur">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLayoutMode("folders")}
                  className={cn(
                    "cursor-pointer rounded-full border-0",
                    layoutMode === "folders" && "bg-muted"
                  )}
                  aria-pressed={layoutMode === "folders"}
                  aria-label="Folders layout"
                >
                  <FoldersIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editMode && (
        <>
          <GradualBlurMemo
            className="right-0 bottom-0 left-0"
            position="bottom"
            target="page"
            strength={0.5}
            height="4rem"
            divCount={5}
            zIndex={0}
            style={{ right: "calc(100vw - 100%)" }}
          />
          <div
            className="fixed right-4 bottom-4 left-4 z-[110] flex justify-center"
            aria-label="Edit actions toolbar"
          >
            <div className="flex items-center rounded-full border border-border bg-background/95 shadow-sm backdrop-blur">
              <Button
                variant="secondary"
                size="lg"
                onClick={onAddSection}
                className="m-1 cursor-pointer gap-1.5 rounded-full"
                aria-label={
                  layoutMode === "folders" ? "Add folder" : "Add section"
                }
              >
                <SelectionPlusIcon className="size-4" />
                <span className="hidden sm:inline">
                  {layoutMode === "folders" ? "Add folder" : "Add section"}
                </span>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onAddStandaloneLink}
                className="m-1 cursor-pointer gap-1.5 rounded-full border-l border-border"
                aria-label="Add link"
              >
                <LinkSimpleIcon className="size-4" />
                <span className="hidden sm:inline">Add link</span>
              </Button>
              {layoutMode === "canvas" &&
                state.sections.length > 0 &&
                hasCustomLayout(state.sections) && (
                  <>
                    {/* <div className="h-5 w-px bg-border" aria-hidden /> */}
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() =>
                        save((prev) => ({
                          ...prev,
                          sections: resetSectionPositions(prev.sections),
                        }))
                      }
                      className="cursor-pointer rounded-l-none text-xs text-muted-foreground"
                      title="Reset section positions to grid"
                    >
                      <ArrowClockwiseIcon className="size-4" />
                      Reset positions
                    </Button>
                  </>
                )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
