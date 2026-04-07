import gsap from "gsap"

export function prefersFolderFlipReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function escapeAttr(value: string): string {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replace(/["\\]/g, "\\$&")
}

export type FolderOpenFlipCapture = {
  thumbRects: Map<string, DOMRect>
  /** Whole folder tile on the grid — used to FLIP the open-folder backdrop. */
  tileRect: DOMRect | null
}

export function collectFolderOpenFlipCapture(
  sectionId: string
): FolderOpenFlipCapture {
  const thumbRects = new Map<string, DOMRect>()
  const tile = document.querySelector(
    `[data-folder-tile-id="${escapeAttr(sectionId)}"]`
  )
  if (!tile || !(tile instanceof HTMLElement)) {
    return { thumbRects, tileRect: null }
  }
  const tileRect = tile.getBoundingClientRect()
  tile.querySelectorAll("[data-folder-flip-source]").forEach((el) => {
    const lid = el.getAttribute("data-folder-flip-source")
    if (lid) thumbRects.set(lid, el.getBoundingClientRect())
  })
  return { thumbRects, tileRect }
}

const FLIP_DURATION = 0.22

/**
 * After opening a folder: backdrop FLIPs from the folder tile; link cards FLIP from thumbnails.
 * Hides targets for one frame, then measures — avoids a flash at the end position.
 * Links without a tile thumb fade in with a short stagger.
 */
export function runFolderLinkEntranceFromTile(
  fromRects: Map<string, DOMRect>,
  sectionId: string,
  tileRect: DOMRect | null
): void {
  if (prefersFolderFlipReducedMotion()) return

  const panelSel = `[data-folder-panel="${escapeAttr(sectionId)}"]`

  requestAnimationFrame(() => {
    const panel = document.querySelector(panelSel)
    if (!panel) return
    const backdrop = panel.querySelector("[data-folder-flip-backdrop]")
    const targets = [
      ...panel.querySelectorAll("[data-folder-flip-target]"),
    ].filter((n): n is HTMLElement => n instanceof HTMLElement)
    targets.forEach((node) => {
      gsap.set(node, { opacity: 0 })
    })
    if (backdrop instanceof HTMLElement) {
      gsap.set(backdrop, { opacity: 0 })
    }

    requestAnimationFrame(() => {
      if (backdrop instanceof HTMLElement && tileRect) {
        const to = backdrop.getBoundingClientRect()
        if (to.width >= 1 && to.height >= 1) {
          const dx = tileRect.left - to.left
          const dy = tileRect.top - to.top
          const sx = tileRect.width / to.width
          const sy = tileRect.height / to.height
          gsap.set(backdrop, {
            transformOrigin: "0 0",
            x: dx,
            y: dy,
            scaleX: sx,
            scaleY: sy,
            opacity: 0,
          })
          gsap.to(backdrop, {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            duration: FLIP_DURATION,
            ease: "power2.out",
            clearProps: "opacity,transform",
            overwrite: "auto",
          })
        } else {
          gsap.set(backdrop, { opacity: 1, clearProps: "opacity" })
        }
      } else if (backdrop instanceof HTMLElement) {
        gsap.to(backdrop, {
          opacity: 1,
          duration: FLIP_DURATION,
          ease: "power2.out",
          clearProps: "opacity",
          overwrite: "auto",
        })
      }

      let noSourceStagger = 0
      targets.forEach((node) => {
        const linkId = node.getAttribute("data-folder-flip-target")
        if (!linkId) return

        const from = fromRects.get(linkId)
        if (!from) {
          gsap.to(node, {
            opacity: 1,
            duration: 0.16,
            delay: 0.022 * noSourceStagger,
            ease: "power2.out",
            clearProps: "opacity",
            overwrite: "auto",
          })
          noSourceStagger += 1
          return
        }

        const to = node.getBoundingClientRect()
        if (to.width < 1 || to.height < 1) {
          gsap.set(node, { opacity: 1, clearProps: "opacity" })
          return
        }

        const dx = from.left - to.left
        const dy = from.top - to.top
        const sx = from.width / to.width
        const sy = from.height / to.height

        gsap.set(node, {
          transformOrigin: "0 0",
          x: dx,
          y: dy,
          scaleX: sx,
          scaleY: sy,
          opacity: 0,
        })
        gsap.to(node, {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: FLIP_DURATION,
          ease: "power2.out",
          clearProps: "opacity,transform",
          overwrite: "auto",
        })
      })
    })
  })
}
