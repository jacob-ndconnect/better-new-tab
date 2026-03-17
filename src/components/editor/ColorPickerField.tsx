import { Input } from "@/components/ui/input"
import { COLOR_SWATCHES } from "@/lib/color-swatches"

type ColorPickerFieldProps = {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPickerField({
  value,
  onChange,
  label = "Color",
}: ColorPickerFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 cursor-pointer rounded border border-input bg-transparent p-0"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-24 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="size-6 rounded-none border-2 border-transparent transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: color,
              borderColor: value === color ? "var(--foreground)" : "transparent",
            }}
            aria-label={`Select ${color}`}
          />
        ))}
      </div>
    </div>
  )
}
