export function getFaviconUrl(url: string, size = 64): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
  } catch {
    return "" // fallback to placeholder
  }
}
