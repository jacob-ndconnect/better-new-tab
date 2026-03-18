/** Primary source: DuckDuckGo (reliable for arbitrary domains). */
export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`
  } catch {
    return ""
  }
}

/** Fallback when primary fails; only available in extension context. */
export function getFaviconFallbackUrl(url: string, size = 64): string {
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"))
      faviconUrl.searchParams.set("pageUrl", url)
      faviconUrl.searchParams.set("size", String(size))
      return faviconUrl.toString()
    }
  } catch {
    // ignore
  }
  return ""
}
