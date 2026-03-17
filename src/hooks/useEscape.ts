import { useEffect } from "react"

type UseEscapeOptions = {
  onEscape: () => void
  enabled?: boolean
}

export function useEscape({ onEscape, enabled = true }: UseEscapeOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onEscape()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onEscape, enabled])
}
