import { cn } from "@/lib/utils"

type DotBackgroundProps = {
  className: string
}

/** Full-viewport dots; fixed so it does not consume layout height below siblings. */
export function DotBackground({ className }: DotBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0",
        "[background-size:20px_20px]",
        "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
        "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        className,
      )}
    />
  )
}
