import type { AppState, Link } from "@/types"
import { UNGROUPED_SECTION_ID } from "@/types"

const STANDALONE_SPAWN_BASE = 40
const STANDALONE_SPAWN_STEP = 24

type SectionPlacement = { kind: "section"; sectionId: string }

function isUngrouped(sectionId: string): boolean {
  return sectionId === UNGROUPED_SECTION_ID
}

function defaultStandalonePosition(index: number): { x: number; y: number } {
  return {
    x: STANDALONE_SPAWN_BASE + index * STANDALONE_SPAWN_STEP,
    y: STANDALONE_SPAWN_BASE + index * STANDALONE_SPAWN_STEP,
  }
}

/**
 * Move a link between a real section and ungrouped (standalone) storage.
 * List view uses UNGROUPED_SECTION_ID for the synthetic row; canvas stores those links in `standaloneLinks`.
 */
export function moveLinkInState(
  prev: AppState,
  linkId: string,
  from: SectionPlacement,
  to: SectionPlacement,
  opts?: { standalonePosition?: { x: number; y: number } }
): AppState | null {
  if (from.sectionId === to.sectionId) return null

  let link: Link | undefined
  const sections = prev.sections.map((s) => ({ ...s, links: [...s.links] }))
  let standaloneLinks = [...prev.standaloneLinks]

  if (isUngrouped(from.sectionId)) {
    const idx = standaloneLinks.findIndex((e) => e.link.id === linkId)
    if (idx < 0) return null
    link = standaloneLinks[idx].link
    standaloneLinks = standaloneLinks.filter((e) => e.link.id !== linkId)
  } else {
    const sIdx = sections.findIndex((s) => s.id === from.sectionId)
    if (sIdx < 0) return null
    const lIdx = sections[sIdx].links.findIndex((l) => l.id === linkId)
    if (lIdx < 0) return null
    link = sections[sIdx].links[lIdx]
    sections[sIdx] = {
      ...sections[sIdx],
      links: sections[sIdx].links.filter((l) => l.id !== linkId),
    }
  }

  if (!link) return null

  if (isUngrouped(to.sectionId)) {
    const pos =
      opts?.standalonePosition ??
      defaultStandalonePosition(standaloneLinks.length)
    standaloneLinks = [...standaloneLinks, { link, position: pos }]
    return { ...prev, sections, standaloneLinks }
  }

  const tIdx = sections.findIndex((s) => s.id === to.sectionId)
  if (tIdx < 0) return null
  sections[tIdx] = {
    ...sections[tIdx],
    links: [...sections[tIdx].links, link],
  }
  return { ...prev, sections, standaloneLinks }
}
