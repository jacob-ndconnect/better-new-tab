import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColorPickerField } from "./ColorPickerField"
import { LinkCard } from "@/components/canvas/LinkCard"
import type { Link } from "@/types"
import { FloppyDiskIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"

const DEFAULT_BADGE_COLOR = "#ef4444"

type LinkEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: Link | null
  onSave: (link: Link) => void
  onDelete?: (linkId: string) => void
}

export function LinkEditor({
  open,
  onOpenChange,
  link,
  onSave,
  onDelete,
}: LinkEditorProps) {
  const [url, setUrl] = useState(() => link?.url ?? "")
  const [label, setLabel] = useState(() => link?.label ?? "")
  const [badgeEmoji, setBadgeEmoji] = useState(() => link?.badge?.emoji ?? "")
  const [badgeColor, setBadgeColor] = useState(
    () => link?.badge?.color ?? DEFAULT_BADGE_COLOR
  )

  const previewLink: Link = {
    id: link?.id ?? "preview",
    url: url || "https://example.com",
    label: label || "Link",
    badge:
      badgeEmoji.trim().length > 0
        ? { emoji: badgeEmoji.slice(0, 2), color: badgeColor }
        : undefined,
  }

  const handleSave = () => {
    const trimmedUrl = url.trim()
    const trimmedLabel = label.trim()
    if (!trimmedUrl || !trimmedLabel) return

    onSave({
      id: link?.id ?? crypto.randomUUID(),
      url: trimmedUrl,
      label: trimmedLabel,
      badge:
        badgeEmoji.trim().length > 0
          ? { emoji: badgeEmoji.slice(0, 2), color: badgeColor }
          : undefined,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (link && onDelete) {
      onDelete(link.id)
      onOpenChange(false)
    }
  }

  const isEditing = !!link

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Link" : "Add Link"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="link-url"
              className="text-xs font-medium text-muted-foreground"
            >
              URL
            </label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="link-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Label
            </label>
            <Input
              id="link-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Display name"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="link-badge"
              className="text-xs font-medium text-muted-foreground"
            >
              Badge emoji (max 2 chars)
            </label>
            <Input
              id="link-badge"
              value={badgeEmoji}
              onChange={(e) => setBadgeEmoji(e.target.value.slice(0, 2))}
              placeholder="🚀 or dev"
              maxLength={2}
            />
          </div>
          {badgeEmoji.trim().length > 0 && (
            <ColorPickerField
              value={badgeColor}
              onChange={setBadgeColor}
              label="Badge color"
            />
          )}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Preview
            </span>
            <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-6">
              <LinkCard link={previewLink} editMode={false} />
            </div>
          </div>
        </div>
        <DialogFooter>
          {isEditing && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="text-md mr-auto cursor-pointer"
              size="lg"
            >
              Delete <TrashIcon />
            </Button>
          )}
          <Button
            className="text-md cursor-pointer"
            size="lg"
            onClick={handleSave}
            disabled={!url.trim() || !label.trim()}
          >
            <FloppyDiskIcon /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
