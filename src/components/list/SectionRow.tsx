import { GearSixIcon, PlusIcon } from "@phosphor-icons/react"
import { LinkCard } from "@/components/canvas/LinkCard"
import type { Section } from "@/types"

type SectionRowProps = {
  section: Section
  editMode: boolean
  onEditSection?: () => void
  onEditLink?: (linkId: string) => void
  onAddLink?: () => void
}

export function SectionRow({
  section,
  editMode,
  onEditSection,
  onEditLink,
  onAddLink,
}: SectionRowProps) {
  return (
    <section className="border-b border-border/60 py-6 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: section.accentColor }}
          aria-hidden
        />
        <h2
          className="text-sm font-semibold"
          style={{ color: section.accentColor }}
        >
          {section.name}
        </h2>
        {editMode && onEditSection && (
          <button
            type="button"
            onClick={onEditSection}
            className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Edit section"
          >
            <GearSixIcon className="size-4" />
          </button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 pt-4 pr-4">
        {section.links.map((link) => (
          <div key={link.id} className="shrink-0 pt-2 pr-2">
            <LinkCard
              link={link}
              editMode={editMode}
              onEdit={onEditLink ? () => onEditLink(link.id) : undefined}
            />
          </div>
        ))}
        {editMode && onAddLink && (
          <button
            type="button"
            onClick={onAddLink}
            className="flex size-[88px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
          >
            <PlusIcon className="size-6" />
            <span className="text-xs">Add Link</span>
          </button>
        )}
      </div>
    </section>
  )
}
