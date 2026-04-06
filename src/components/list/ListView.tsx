import { SectionRow } from "./SectionRow"
import {
  type Section,
  type StandaloneLinkEntry,
  UNGROUPED_SECTION_ID,
} from "@/types"

const UNGROUPED_ACCENT = "#71717a"

type ListViewProps = {
  sections: Section[]
  standaloneLinks: StandaloneLinkEntry[]
  editMode: boolean
  onEditSection?: (section: Section) => void
  onEditLink?: (sectionId: string, linkId: string) => void
  onAddLink?: (sectionId: string) => void
  onEditStandaloneLink?: (linkId: string) => void
  onAddStandaloneLink?: () => void
}

export function ListView({
  sections,
  standaloneLinks,
  editMode,
  onEditSection,
  onEditLink,
  onAddLink,
  onEditStandaloneLink,
  onAddStandaloneLink,
}: ListViewProps) {
  const ungroupedSection: Section = {
    id: UNGROUPED_SECTION_ID,
    name: "Ungrouped",
    accentColor: UNGROUPED_ACCENT,
    links: standaloneLinks.map((e) => e.link),
    position: { x: 0, y: 0 },
  }

  return (
    <div className="h-svh overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {standaloneLinks.length > 0 && (
          <SectionRow
            key={UNGROUPED_SECTION_ID}
            section={ungroupedSection}
            editMode={editMode}
            onEditLink={
              onEditStandaloneLink
                ? (linkId) => onEditStandaloneLink(linkId)
                : undefined
            }
            onAddLink={onAddStandaloneLink}
          />
        )}
        {sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            editMode={editMode}
            onEditSection={
              onEditSection ? () => onEditSection?.(section) : undefined
            }
            onEditLink={
              onEditLink ? (linkId) => onEditLink(section.id, linkId) : undefined
            }
            onAddLink={onAddLink ? () => onAddLink(section.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
