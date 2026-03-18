import { useState, useCallback } from "react"
import { Canvas } from "@/components/canvas/Canvas"
import { ListView } from "@/components/list/ListView"
import { EmptyState } from "@/components/EmptyState"
import { CommandPalette } from "@/components/search/CommandPalette"
import { EditModeToolbar } from "@/components/editor/EditModeToolbar"
import { SectionEditor } from "@/components/editor/SectionEditor"
import { LinkEditor } from "@/components/editor/LinkEditor"
import { SettingsDrawer } from "@/components/settings/SettingsDrawer"
import { useStorage } from "@/hooks/useStorage"
import { useHotkey } from "@tanstack/react-hotkeys"
import { useEscape } from "@/hooks/useEscape"
import type { Section, Link } from "@/types"
import { DotBackground } from "./components/canvas/DotGridBackground"

export function App() {
  const { state, save, loaded } = useStorage()
  const [commandOpen, setCommandOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sectionEditorOpen, setSectionEditorOpen] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null)
  const [linkEditorOpen, setLinkEditorOpen] = useState(false)
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null)
  const [sectionIdForLink, setSectionIdForLink] = useState<string | null>(null)

  const searchShortcut = state.settings.searchShortcut
  useHotkey(
    searchShortcut,
    useCallback(() => setCommandOpen((prev) => !prev), [])
  )

  const handleEscape = useCallback(() => {
    if (settingsOpen) {
      setSettingsOpen(false)
    } else if (commandOpen) {
      setCommandOpen(false)
    } else if (sectionEditorOpen) {
      setSectionEditorOpen(false)
    } else if (linkEditorOpen) {
      setLinkEditorOpen(false)
    } else if (state.editMode) {
      save((prev) => ({ ...prev, editMode: false }))
    }
  }, [
    settingsOpen,
    commandOpen,
    sectionEditorOpen,
    linkEditorOpen,
    state.editMode,
    state,
    save,
  ])

  useEscape({ onEscape: handleEscape })

  const openAddSection = () => {
    setSectionToEdit(null)
    setSectionEditorOpen(true)
  }

  const openEditSection = useCallback((section: Section) => {
    setSectionToEdit(section)
    setSectionEditorOpen(true)
  }, [])

  const openEditLink = useCallback(
    (sectionId: string, linkId: string) => {
      const section = state.sections.find((s) => s.id === sectionId)
      const link = section?.links.find((l) => l.id === linkId) ?? null
      setLinkToEdit(link)
      setSectionIdForLink(sectionId)
      setLinkEditorOpen(true)
    },
    [state.sections]
  )

  const openAddLink = useCallback((sectionId: string) => {
    setLinkToEdit(null)
    setSectionIdForLink(sectionId)
    setLinkEditorOpen(true)
  }, [])

  const handleSectionSave = useCallback(
    (section: Section) => {
      save((prev) => {
        const exists = prev.sections.some((s) => s.id === section.id)
        const newSections = exists
          ? prev.sections.map((s) => (s.id === section.id ? section : s))
          : [...prev.sections, section]
        return { ...prev, sections: newSections }
      })
    },
    [save]
  )

  const handleLinkSave = useCallback(
    (link: Link) => {
      if (!sectionIdForLink) return
      save((prev) => {
        const newSections = prev.sections.map((s) => {
          if (s.id !== sectionIdForLink) return s
          const exists = s.links.some((l) => l.id === link.id)
          const newLinks = exists
            ? s.links.map((l) => (l.id === link.id ? link : l))
            : [...s.links, link]
          return { ...s, links: newLinks }
        })
        return { ...prev, sections: newSections }
      })
    },
    [save, sectionIdForLink]
  )

  const handleLinkDelete = useCallback(
    (linkId: string) => {
      if (!sectionIdForLink) return
      save((prev) => {
        const newSections = prev.sections.map((s) => {
          if (s.id !== sectionIdForLink) return s
          return { ...s, links: s.links.filter((l) => l.id !== linkId) }
        })
        return { ...prev, sections: newSections }
      })
    },
    [save, sectionIdForLink]
  )

  if (!loaded) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const isEmpty = state.sections.length === 0

  return (
    <>
      {isEmpty ? (
        <EmptyState
          onEditClick={() => save((prev) => ({ ...prev, editMode: true }))}
        />
      ) : (
        <div key={state.layoutMode} className="layout-transition fixed inset-0">
          {state.layoutMode === "canvas" ? (
            <>
              <DotBackground className="fixed inset-0 bg-background" />
              <Canvas
                state={state}
                save={save}
                onEditSection={openEditSection}
                onEditLink={openEditLink}
                onAddLink={openAddLink}
              />
            </>
          ) : (
            <ListView
              sections={state.sections}
              editMode={state.editMode}
              onEditSection={openEditSection}
              onEditLink={openEditLink}
              onAddLink={openAddLink}
            />
          )}
        </div>
      )}
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        sections={state.sections}
      />
      <EditModeToolbar
        state={state}
        save={save}
        onAddSection={openAddSection}
        searchOpen={commandOpen}
        onSearchClick={() => setCommandOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={state.settings}
        onSave={(settings) => save((prev) => ({ ...prev, settings }))}
      />
      <SectionEditor
        open={sectionEditorOpen}
        onOpenChange={setSectionEditorOpen}
        section={sectionToEdit}
        onSave={handleSectionSave}
      />
      <LinkEditor
        key={linkEditorOpen ? (linkToEdit?.id ?? "new") : "closed"}
        open={linkEditorOpen}
        onOpenChange={setLinkEditorOpen}
        link={linkToEdit}
        onSave={handleLinkSave}
        onDelete={linkToEdit ? handleLinkDelete : undefined}
      />
    </>
  )
}

export default App
