import { useHotkeyRecorder, formatForDisplay } from "@tanstack/react-hotkeys"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

type HotkeySettingProps = {
  label: string
  description?: string
  value: string
  onChange: (hotkey: string) => void
}

export function HotkeySetting({
  label,
  description,
  value,
  onChange,
}: HotkeySettingProps) {
  const recorder = useHotkeyRecorder({
    onRecord: (hotkey) => onChange(hotkey ?? value),
    onCancel: () => {},
  })

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground/80">{description}</p>
      )}
      <div className="flex items-center gap-2">
        <div className="flex min-h-8 flex-1 items-center gap-1 rounded border border-input bg-muted/30 px-2.5">
          {recorder.isRecording ? (
            <span className="text-xs text-muted-foreground">
              Press a key combination...
            </span>
          ) : (
            <Kbd className="rounded">{formatForDisplay(value)}</Kbd>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={recorder.isRecording ? recorder.cancelRecording : recorder.startRecording}
          className="shrink-0"
        >
          {recorder.isRecording ? "Cancel" : "Change"}
        </Button>
      </div>
    </div>
  )
}
