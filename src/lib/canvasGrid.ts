/** Canvas layout constants — keep in sync with dot grid spacing in the UI. */

export const CANVAS_GRID_OFFSET = 40
export const CANVAS_GRID_GAP = 20
export const CANVAS_SECTION_COLUMN_WIDTH = 280
export const CANVAS_SECTION_ROW_HEIGHT = 200

const COLUMN_STRIDE = CANVAS_SECTION_COLUMN_WIDTH + CANVAS_GRID_GAP

export const MAX_CANVAS_COLUMN_SPAN = 64

/** Matches `LinkCard` (80px) + `pr-2` on `SectionLinkDraggable` + `gap-4` between items. */
export const LINK_CARD_WIDTH_PX = 88
export const LINK_CARD_GAP_PX = 16

/** Narrow shape so callers need not import `Section`. */
export type CanvasColumnSpanSource = {
  canvasColumnSpan?: number
  links: readonly unknown[]
}

/** At least 1; at most one column per link (empty section → 1). */
export function maxCanvasColumnSpanForSection(
  section: CanvasColumnSpanSource
): number {
  return Math.max(1, section.links.length)
}

/**
 * Effective span: explicit `canvasColumnSpan` when set (clamped to link count),
 * otherwise one link-column per link (minimum 1).
 *
 * Span = **how many link tiles fit per row** (not 280px canvas grid columns).
 */
export function effectiveCanvasColumnSpan(
  section: CanvasColumnSpanSource
): number {
  const cap = maxCanvasColumnSpanForSection(section)
  if (section.canvasColumnSpan !== undefined) {
    return Math.min(normalizeCanvasColumnSpan(section.canvasColumnSpan), cap)
  }
  return cap
}

export function getDefaultCanvasSectionPosition(index: number): {
  x: number
  y: number
} {
  const col = index % 3
  const row = Math.floor(index / 3)
  return {
    x: CANVAS_GRID_OFFSET + col * COLUMN_STRIDE,
    y:
      CANVAS_GRID_OFFSET +
      row * (CANVAS_SECTION_ROW_HEIGHT + CANVAS_GRID_GAP),
  }
}

export function normalizeCanvasColumnSpan(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value)
    return Math.max(1, Math.min(MAX_CANVAS_COLUMN_SPAN, rounded))
  }
  return 1
}

/** Horizontal width inside the links panel for one row of `n` tiles (before links `p-4`). */
export function linkRowInnerWidthPx(linkColumnSpan: number): number {
  const n = normalizeCanvasColumnSpan(linkColumnSpan)
  return n * LINK_CARD_WIDTH_PX + (n - 1) * LINK_CARD_GAP_PX
}

/** Horizontal padding (Tailwind `p-4` × 2) on the section outer wrapper. */
export const SECTION_FRAME_OUTER_PADDING_X = 32

/** Horizontal padding (Tailwind `p-4` × 2) on the links panel (`SectionFrame` inner card). */
export const SECTION_LINKS_INNER_PADDING_X = 32

/** Horizontal border (default `border` = 1px L+R) on the links panel. */
export const SECTION_LINKS_BORDER_X = 2

/** Prefer measured value; links panel uses `border`. */
export function readHorizontalBorderPx(el: HTMLElement): number {
  const st = getComputedStyle(el)
  const l = Number.parseFloat(st.borderLeftWidth)
  const r = Number.parseFloat(st.borderRightWidth)
  const sum =
    (Number.isFinite(l) ? l : 0) + (Number.isFinite(r) ? r : 0)
  return sum > 0 ? sum : SECTION_LINKS_BORDER_X
}

/**
 * Section outer border-box width: link row + outer `p-4` + links `p-4` +
 * links horizontal border (tile flex/grid sits in links **content** box).
 */
export function sectionFrameOuterWidthPx(linkColumnSpan: number): number {
  return (
    linkRowInnerWidthPx(linkColumnSpan) +
    SECTION_FRAME_OUTER_PADDING_X +
    SECTION_LINKS_INNER_PADDING_X +
    SECTION_LINKS_BORDER_X
  )
}

/** Prefer over constant when converting measured widths (theme-safe). */
export function readHorizontalPaddingPx(
  el: HTMLElement,
  fallback: number
): number {
  const st = getComputedStyle(el)
  const left = Number.parseFloat(st.paddingLeft)
  const right = Number.parseFloat(st.paddingRight)
  const sum =
    (Number.isFinite(left) ? left : 0) + (Number.isFinite(right) ? right : 0)
  return sum > 0 ? sum : fallback
}

/** Map link-row inner width (px) → span via closest nominal; only 1…maxSpan. */
export function canvasColumnSpanFromTargetWidth(
  linkRowInnerPx: number,
  maxSpan: number = MAX_CANVAS_COLUMN_SPAN
): number {
  const w = Math.max(0, linkRowInnerPx)
  const cap = Math.max(
    1,
    Math.min(MAX_CANVAS_COLUMN_SPAN, Math.round(maxSpan))
  )
  let best = 1
  let bestDist = Infinity
  for (let s = 1; s <= cap; s++) {
    const nominal = linkRowInnerWidthPx(s)
    const d = Math.abs(w - nominal)
    if (d < bestDist || (d === bestDist && s > best)) {
      bestDist = d
      best = s
    }
  }
  return best
}

/**
 * `outerBorderBoxPx` = section frame `getBoundingClientRect().width`;
 * subtract outer padding, links padding, and links horizontal border.
 */
export function canvasColumnSpanFromOuterFrameWidth(
  outerBorderBoxPx: number,
  outerHorizontalPaddingPx: number = SECTION_FRAME_OUTER_PADDING_X,
  linksHorizontalPaddingPx: number = SECTION_LINKS_INNER_PADDING_X,
  linksHorizontalBorderPx: number = SECTION_LINKS_BORDER_X,
  maxSpan: number = MAX_CANVAS_COLUMN_SPAN
): number {
  const linksBorderBoxW = Math.max(
    0,
    outerBorderBoxPx - outerHorizontalPaddingPx
  )
  const tileInner = Math.max(
    0,
    linksBorderBoxW - linksHorizontalPaddingPx - linksHorizontalBorderPx
  )
  return canvasColumnSpanFromTargetWidth(tileInner, maxSpan)
}
