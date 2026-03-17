import { SectionRow } from "./SectionRow"
import type { Section } from "@/types"


type ListViewProps = {
  sections: Section[]
  editMode: boolean
  onEditSection?: (section: Section) => void
  onEditLink?: (sectionId: string, linkId: string) => void
  onAddLink?: (sectionId: string) => void
}

export function ListView({
  sections,
  editMode,
  onEditSection,
  onEditLink,
  onAddLink,
}: ListViewProps) {
  return (
    <div className="h-svh overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
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
