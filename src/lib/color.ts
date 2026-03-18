/** Returns black or white for best contrast on the given hex background. */
export function getContrastColor(hex: string): "#000000" | "#ffffff" {
  const match = hex.replace(/^#/, "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return "#ffffff"

  let r: number, g: number, b: number
  const h = match[1]
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16)
    g = parseInt(h[1] + h[1], 16)
    b = parseInt(h[2] + h[2], 16)
  } else {
    r = parseInt(h.slice(0, 2), 16)
    g = parseInt(h.slice(2, 4), 16)
    b = parseInt(h.slice(4, 6), 16)
  }

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs

  return luminance > 0.5 ? "#000000" : "#ffffff"
}
