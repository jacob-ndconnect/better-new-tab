import { useState } from "react"
import { PencilIcon } from "@phosphor-icons/react"
import { getFaviconFallbackUrl, getFaviconUrl } from "@/lib/favicon"
import { cn } from "@/lib/utils"
import type { Link } from "@/types"

type LinkCardProps = {
  link: Link
  editMode: boolean
  onEdit?: () => void
}

function getPlaceholderColor(label: string): string {
  const hue = label.charCodeAt(0) % 360
  return `hsl(${hue}, 65%, 55%)`
}

export function LinkCard({ link, editMode, onEdit }: LinkCardProps) {
  const [faviconError, setFaviconError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [prevUrl, setPrevUrl] = useState(link.url)
  if (prevUrl !== link.url) {
    setPrevUrl(link.url)
    setFaviconError(false)
    setUseFallback(false)
  }
  const faviconUrl = getFaviconUrl(link.url)
  const fallbackUrl = getFaviconFallbackUrl(link.url)
  const currentSrc = useFallback ? fallbackUrl : faviconUrl
  const showPlaceholder = faviconError || !currentSrc
  const placeholderColor = getPlaceholderColor(link.label)
  const firstLetter = link.label.charAt(0).toUpperCase() || "?"

  const handleFaviconError = () => {
    if (!useFallback && fallbackUrl) {
      setUseFallback(true)
    } else {
      setFaviconError(true)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (editMode && onEdit) {
      e.preventDefault()
      onEdit()
    }
  }

  return (
    <a
      href={link.url}
      rel="noopener noreferrer"
      draggable={editMode ? false : undefined}
      onClick={handleClick}
      onDragStart={editMode ? (e) => e.preventDefault() : undefined}
      className={cn(
        "group flex w-[80px] flex-col items-center gap-2 rounded-2xl p-0 text-inherit no-underline transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      )}
    >
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex size-16 items-center justify-center overflow-hidden rounded-2xl",
            showPlaceholder && "text-white"
          )}
          style={
            showPlaceholder ? { backgroundColor: placeholderColor } : undefined
          }
        >
          {showPlaceholder ? (
            <span className="text-2xl font-semibold">{firstLetter}</span>
          ) : (
            <img
              src={currentSrc}
              alt=""
              draggable={editMode ? false : undefined}
              className="size-full object-cover"
              onError={handleFaviconError}
            />
          )}
        </div>

        {link.badge && (
          <span
            className="absolute -top-1 -right-1 flex size-[22px] items-center justify-center rounded-full text-xs ring-2 ring-background"
            style={{ backgroundColor: link.badge.color }}
            aria-hidden
          >
            {link.badge.emoji}
          </span>
        )}

        {editMode && (
          <span
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <PencilIcon className="size-6 text-white" weight="bold" />
          </span>
        )}
      </div>

      <span className="max-w-[80px] truncate text-center text-xs text-muted-foreground">
        {link.label}
      </span>
    </a>
  )
}
