type LinkDropTargetOverlayProps = {
  visible: boolean
  message: string
}

/**
 * Covers the link drop zone while a link is held over it. `pointer-events-none` so collision / pointer tracking stay on the droppable node.
 */
export function LinkDropTargetOverlay({
  visible,
  message,
}: LinkDropTargetOverlayProps) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-[inherit] bg-background/90 ring-2 ring-primary/45"
      role="status"
      aria-live="polite"
    >
      <span className="max-w-[12rem] px-2 text-center text-sm font-medium text-foreground">
        {message}
      </span>
    </div>
  )
}
