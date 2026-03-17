import { useState, useEffect } from "react"
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
import type { Section } from "@/types"

type SectionEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: Section | null
  onSave: (section: Section) => void
}

const DEFAULT_COLOR = "#3b82f6"

export function SectionEditor({
  open,
  onOpenChange,
  section,
  onSave,
}: SectionEditorProps) {
  const [name, setName] = useState("")
  const [accentColor, setAccentColor] = useState(DEFAULT_COLOR)

  useEffect(() => {
    if (open) {
      setName(section?.name ?? "")
      setAccentColor(section?.accentColor ?? DEFAULT_COLOR)
    }
  }, [open, section])

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return

    onSave({
      id: section?.id ?? crypto.randomUUID(),
      name: trimmed,
      accentColor,
      links: section?.links ?? [],
      position: section?.position ?? { x: 40, y: 40 },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "Add Section"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="section-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Section name
            </label>
            <Input
              id="section-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Personal"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <ColorPickerField
            value={accentColor}
            onChange={setAccentColor}
            label="Accent color"
          />
        </div>
        <DialogFooter>
          <Button
            size="lg"
            className="rounded-full"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="rounded-full"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
