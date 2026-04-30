import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react"

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return !!target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
}

type PanSession = {
  scrollEl: HTMLElement
  pointerId: number
  startClientX: number
  startClientY: number
  startScrollLeft: number
  startScrollTop: number
}

type UseCanvasPointerPanOptions = {
  scrollRef: RefObject<HTMLElement | null>
}

type UseCanvasPointerPanResult = {
  onPointerDownCapture: (e: ReactPointerEvent<HTMLElement>) => void
  onLostPointerCapture: (e: ReactPointerEvent<HTMLElement>) => void
  /** Space held (for grab cursor); not typing in a field */
  spaceDown: boolean
  isPanning: boolean
}

export function useCanvasPointerPan({
  scrollRef,
}: UseCanvasPointerPanOptions): UseCanvasPointerPanResult {
  const [spaceDown, setSpaceDown] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const spacePressedRef = useRef(false)
  const panSessionRef = useRef<PanSession | null>(null)

  const setSpacePressed = useCallback((next: boolean) => {
    spacePressedRef.current = next
    setSpaceDown(next)
  }, [])

  const clearPanSession = useCallback(() => {
    const session = panSessionRef.current
    if (!session) return
    panSessionRef.current = null
    try {
      session.scrollEl.releasePointerCapture(session.pointerId)
    } catch {
      // ignore
    }
    session.scrollEl.style.userSelect = ""
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return
      if (isEditableTarget(e.target)) return
      // Hold-to-repeat sends keydown with `repeat`; still preventDefault or the page scrolls.
      e.preventDefault()
      if (!e.repeat) {
        setSpacePressed(true)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return
      setSpacePressed(false)
    }

    const onBlur = () => {
      setSpacePressed(false)
      clearPanSession()
    }

    const onResize = () => {
      clearPanSession()
    }

    window.addEventListener("keydown", onKeyDown, true)
    window.addEventListener("keyup", onKeyUp, true)
    window.addEventListener("blur", onBlur)
    window.addEventListener("resize", onResize, { passive: true })

    return () => {
      window.removeEventListener("keydown", onKeyDown, true)
      window.removeEventListener("keyup", onKeyUp, true)
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("resize", onResize)
    }
  }, [setSpacePressed, clearPanSession])

  const endPan = useCallback((e: PointerEvent) => {
    const session = panSessionRef.current
    if (!session || e.pointerId !== session.pointerId) return
    clearPanSession()
  }, [clearPanSession])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const session = panSessionRef.current
      if (!session || e.pointerId !== session.pointerId) return
      const { scrollEl, startClientX, startClientY, startScrollLeft, startScrollTop } =
        session
      scrollEl.scrollLeft = startScrollLeft - (e.clientX - startClientX)
      scrollEl.scrollTop = startScrollTop - (e.clientY - startClientY)
    }

    const onUpOrCancel = (e: PointerEvent) => {
      if (panSessionRef.current?.pointerId === e.pointerId) {
        endPan(e)
      }
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUpOrCancel)
    window.addEventListener("pointercancel", onUpOrCancel)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUpOrCancel)
      window.removeEventListener("pointercancel", onUpOrCancel)
    }
  }, [endPan])

  const onPointerDownCapture = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const scrollEl = scrollRef.current
      if (!scrollEl || e.currentTarget !== scrollEl) return

      const target = e.target
      if (!(target instanceof Element)) return

      const middle = e.button === 1
      const spacePrimary = e.button === 0 && spacePressedRef.current

      if (middle) {
        if (target.closest("a[href]")) return
        e.preventDefault()
        e.stopPropagation()
      } else if (spacePrimary) {
        e.preventDefault()
        e.stopPropagation()
      } else {
        return
      }

      panSessionRef.current = {
        scrollEl,
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startScrollLeft: scrollEl.scrollLeft,
        startScrollTop: scrollEl.scrollTop,
      }
      scrollEl.style.userSelect = "none"
      setIsPanning(true)
      try {
        scrollEl.setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    },
    [scrollRef]
  )

  const onLostPointerCapture = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (panSessionRef.current?.pointerId !== e.pointerId) return
      panSessionRef.current = null
      e.currentTarget.style.userSelect = ""
      setIsPanning(false)
    },
    []
  )

  return {
    onPointerDownCapture,
    onLostPointerCapture,
    spaceDown,
    isPanning,
  }
}
