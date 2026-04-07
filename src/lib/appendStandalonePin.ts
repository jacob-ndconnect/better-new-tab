import type { AppState, Link } from "@/types"
import { standaloneSpawnPosition } from "@/lib/standaloneSpawnPosition"

/** Normalized http(s) URL for deduplication (trailing slash on path, full origin/search/hash). */
export function canonicalPinUrl(url: string): string | null {
  try {
    const u = new URL(url.trim())
    if (u.protocol !== "http:" && u.protocol !== "https:") return null
    const path =
      u.pathname.length > 1 && u.pathname.endsWith("/")
        ? u.pathname.slice(0, -1)
        : u.pathname
    return `${u.origin}${path}${u.search}${u.hash}`
  } catch {
    return null
  }
}

function linkCanonical(url: string): string | null {
  return canonicalPinUrl(url)
}

export function isPinnedUrlCanonical(state: AppState, canonical: string): boolean {
  for (const s of state.sections) {
    for (const l of s.links) {
      if (linkCanonical(l.url) === canonical) return true
    }
  }
  for (const e of state.standaloneLinks) {
    if (linkCanonical(e.link.url) === canonical) return true
  }
  return false
}

function displayLabelFallback(url: string): string {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "")
  } catch {
    return "Pinned link"
  }
}

export function appendStandalonePin(
  prev: AppState,
  url: string,
  label: string
): { next: AppState } | "duplicate" | "invalid" {
  const trimmedUrl = url.trim()
  const canonical = canonicalPinUrl(trimmedUrl)
  if (!canonical) return "invalid"
  if (isPinnedUrlCanonical(prev, canonical)) return "duplicate"

  const displayLabel = label.trim() || displayLabelFallback(trimmedUrl)
  const idx = prev.standaloneLinks.length
  const newLink: Link = {
    id: crypto.randomUUID(),
    url: trimmedUrl,
    label: displayLabel,
  }
  return {
    next: {
      ...prev,
      standaloneLinks: [
        ...prev.standaloneLinks,
        { link: newLink, position: standaloneSpawnPosition(idx) },
      ],
    },
  }
}
