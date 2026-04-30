import { useCallback, useEffect, useRef, type RefObject } from "react"
import {
  applyScrollToCenter,
  readCanvasScrollAnchor,
  viewportCenterInContentSpace,
  writeCanvasScrollAnchor,
} from "@/lib/canvasScrollAnchor"

const DEBOUNCE_MS = 200

type UseCanvasScrollAnchorOptions = {
  scrollRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  remember: boolean
  useSync: boolean
  restoreOnResize: boolean
}

export function useCanvasScrollAnchor({
  scrollRef,
  contentRef,
  remember,
  useSync,
  restoreOnResize,
}: UseCanvasScrollAnchorOptions) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Content-space point that was at the viewport center before the latest scroll / restore — required for resize (re-reading center after resize uses wrong math if scrollLeft is unchanged). */
  const lastContentCenterRef = useRef<{ centerX: number; centerY: number } | null>(
    null
  )
  const reclampRafRef = useRef<number>(0)

  const persistNow = useCallback(() => {
    const el = scrollRef.current
    if (!el || !remember) return
    const anchor = viewportCenterInContentSpace(el)
    lastContentCenterRef.current = anchor
    writeCanvasScrollAnchor(anchor, useSync)
  }, [remember, useSync, scrollRef])

  const schedulePersist = useCallback(() => {
    if (!remember) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      persistNow()
    }, DEBOUNCE_MS)
  }, [remember, persistNow])

  const scheduleReclampForResize = useCallback(() => {
    if (reclampRafRef.current) cancelAnimationFrame(reclampRafRef.current)
    reclampRafRef.current = requestAnimationFrame(() => {
      reclampRafRef.current = 0
      requestAnimationFrame(() => {
        const el = scrollRef.current
        const c = lastContentCenterRef.current
        if (!el || !c) return
        applyScrollToCenter(el, c.centerX, c.centerY)
        lastContentCenterRef.current = viewportCenterInContentSpace(el)
      })
    })
  }, [scrollRef])

  useEffect(() => {
    if (!remember) return

    let cancelled = false

    const run = async () => {
      const anchor = await readCanvasScrollAnchor(useSync)
      if (cancelled || !scrollRef.current) return
      const apply = () => {
        if (cancelled || !scrollRef.current) return
        const t = scrollRef.current
        if (anchor) {
          applyScrollToCenter(t, anchor.centerX, anchor.centerY)
        } else {
          applyScrollToCenter(t, t.scrollWidth / 2, t.scrollHeight / 2)
        }
        lastContentCenterRef.current = viewportCenterInContentSpace(t)
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(apply)
      })
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [remember, useSync, scrollRef])

  useEffect(() => {
    if (!remember) return
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      lastContentCenterRef.current = viewportCenterInContentSpace(el)
      schedulePersist()
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [remember, schedulePersist, scrollRef])

  useEffect(() => {
    const flush = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      persistNow()
    }
    const onVis = () => {
      if (document.visibilityState === "hidden") flush()
    }
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("pagehide", flush)
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("pagehide", flush)
    }
  }, [persistNow])

  useEffect(() => {
    if (!remember || !restoreOnResize) return
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (!scrollEl || !contentEl) return

    const ro = new ResizeObserver(scheduleReclampForResize)
    ro.observe(scrollEl)
    ro.observe(contentEl)
    window.addEventListener("resize", scheduleReclampForResize, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", scheduleReclampForResize)
      if (reclampRafRef.current) cancelAnimationFrame(reclampRafRef.current)
    }
  }, [remember, restoreOnResize, scrollRef, contentRef, scheduleReclampForResize])
}
