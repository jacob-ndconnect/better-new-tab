import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

type DotBackgroundProps = {
  className: string
}

/** Vertical IKEA-style peg holes (pill shape), staggered ~brick / diamond tiling. */
const HOLE_WIDTH = 5
const HOLE_HEIGHT = 20 /** ~4:1 */
const PITCH_X = 60
const PITCH_Y = 34

const colorLight = "#d4d4d4"
const colorDark = "#292826"

/** When true, holes are filled with the peg color (no outline). When false, outlined only. */
const filled: boolean = false

function drawHole(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  fillInsteadOfStroke: boolean
): void {
  const halfW = HOLE_WIDTH / 2
  const x = cx - halfW
  const y = cy - HOLE_HEIGHT / 2
  const r = halfW // stadium caps aligned with hole width

  ctx.beginPath()
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, HOLE_WIDTH, HOLE_HEIGHT, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + HOLE_WIDTH - r, y)
    ctx.arcTo(x + HOLE_WIDTH, y, x + HOLE_WIDTH, y + r, r)
    ctx.lineTo(x + HOLE_WIDTH, y + HOLE_HEIGHT - r)
    ctx.arcTo(
      x + HOLE_WIDTH,
      y + HOLE_HEIGHT,
      x + HOLE_WIDTH - r,
      y + HOLE_HEIGHT,
      r
    )
    ctx.lineTo(x + r, y + HOLE_HEIGHT)
    ctx.arcTo(x, y + HOLE_HEIGHT, x, y + HOLE_HEIGHT - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
  if (fillInsteadOfStroke) {
    ctx.fill()
  } else {
    ctx.stroke()
  }
}

/** Full-viewport pegboard; fixed so it does not consume layout height below siblings. */
export function DotBackground({ className }: DotBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let rafId = 0

    const paint = () => {
      rafId = 0
      const cssW = Math.max(window.innerWidth, 1)
      const cssH = Math.max(window.innerHeight, 1)
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)

      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.clearRect(0, 0, cssW, cssH)

      const pegColor = document.documentElement.classList.contains("dark")
        ? colorDark
        : colorLight

      if (filled) {
        ctx.fillStyle = pegColor
      } else {
        ctx.lineWidth = 1
        ctx.strokeStyle = pegColor
      }

      const pad = HOLE_HEIGHT + 4

      const jMin = Math.floor((-pad - PITCH_Y / 2) / PITCH_Y) - 1
      const jMax = Math.ceil((cssH + pad - PITCH_Y / 2) / PITCH_Y) + 1

      for (let j = jMin; j <= jMax; j++) {
        const cy = PITCH_Y / 2 + j * PITCH_Y
        const off = ((j & 1) * PITCH_X) / 2
        const iMin = Math.floor((-pad - PITCH_X / 2 - off) / PITCH_X) - 2
        const iMax = Math.ceil((cssW + pad - PITCH_X / 2 - off) / PITCH_X) + 2
        for (let i = iMin; i <= iMax; i++) {
          const cx = PITCH_X / 2 + i * PITCH_X + off
          drawHole(ctx, cx, cy, filled)
        }
      }
    }

    const schedulePaint = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(paint)
      }
    }

    paint()

    window.addEventListener("resize", schedulePaint)

    const obs = new MutationObserver(schedulePaint)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      window.removeEventListener("resize", schedulePaint)
      obs.disconnect()
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-0", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-hidden
      />
    </div>
  )
}
