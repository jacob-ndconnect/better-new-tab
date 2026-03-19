/// <reference types="chrome"/>

const STORAGE_KEY = "appState"
const MAX_SUGGESTIONS = 6

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

type Link = { id: string; url: string; label: string; searchTerms?: string }
type Section = { id: string; name: string; links: Link[] }
type AppState = { sections: Section[] }

function matchesQuery(link: Link, query: string): boolean {
  const q = query.toLowerCase().trim()
  if (!q) return true
  const label = link.label.toLowerCase()
  const domain = getDomain(link.url).toLowerCase()
  const terms = (link.searchTerms ?? "").toLowerCase()
  return label.includes(q) || domain.includes(q) || terms.includes(q)
}

function filterLinks(sections: Section[], query: string): Array<{ link: Link; section: Section }> {
  const results: Array<{ link: Link; section: Section }> = []
  for (const section of sections) {
    for (const link of section.links) {
      if (matchesQuery(link, query)) results.push({ link, section })
    }
  }
  return results.slice(0, MAX_SUGGESTIONS)
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

chrome.omnibox.setDefaultSuggestion({ description: "Type to search pinned links" })

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    const appState = result[STORAGE_KEY] as AppState | undefined
    const sections = appState?.sections ?? []
    const matches = filterLinks(sections, text)
    const suggestions = matches.map(({ link }) => {
      const domain = getDomain(link.url)
      const display = link.searchTerms ?? link.label
      const desc = domain ? `${escapeXml(display)} — ${escapeXml(domain)}` : escapeXml(display)
      return { content: link.url, description: desc }
    })
    if (matches.length > 0) {
      const firstDesc = suggestions[0].description
      chrome.omnibox.setDefaultSuggestion({ description: firstDesc })
      suggest(suggestions.slice(1))
    } else {
      chrome.omnibox.setDefaultSuggestion({ description: "Type to search pinned links" })
      suggest([])
    }
  })
})

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const openInNewTab =
    disposition === "newForegroundTab" || disposition === "newBackgroundTab"
  const navigate = (url: string) => {
    if (openInNewTab) chrome.tabs.create({ url })
    else
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { url })
      })
  }
  if (text.startsWith("http")) {
    navigate(text)
    return
  }
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    const appState = result[STORAGE_KEY] as AppState | undefined
    const sections = appState?.sections ?? []
    const matches = filterLinks(sections, text)
    if (matches.length > 0) navigate(matches[0].link.url)
  })
})
