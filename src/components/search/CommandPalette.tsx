import { useCallback, useMemo } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getDomain } from "@/lib/url"
import type { Link, Section } from "@/types"

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: Section[]
}

function openLink(url: string) {
  window.location.href = url
}

export function CommandPalette({
  open,
  onOpenChange,
  sections,
}: CommandPaletteProps) {
  const linkById = useMemo(() => {
    const map = new Map<string, Link>()
    for (const section of sections) {
      for (const link of section.links) {
        map.set(`${section.id}-${link.id}`, link)
      }
    }
    return map
  }, [sections])

  const handleSelect = useCallback(
    (value: string) => {
      const link = linkById.get(value)
      if (link) {
        openLink(link.url)
        onOpenChange(false)
      }
    },
    [linkById, onOpenChange]
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} label="Search links">
      <CommandInput placeholder="Search by name or domain..." />
      <CommandList>
        <CommandEmpty>No links found.</CommandEmpty>
        {sections.map((section) => (
          <CommandGroup key={section.id} heading={section.name}>
            {section.links.map((link) => {
              const domain = getDomain(link.url)
              const keywords = [link.label, domain].filter(Boolean)

              return (
                <CommandItem
                  key={link.id}
                  value={`${section.id}-${link.id}`}
                  keywords={keywords}
                  onSelect={handleSelect}
                >
                  {link.badge?.emoji && (
                    <span className="shrink-0" aria-hidden>
                      {link.badge.emoji}
                    </span>
                  )}
                  <span className="truncate">{link.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
