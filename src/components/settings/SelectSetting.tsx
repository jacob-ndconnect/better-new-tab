import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectSettingProps = {
  id: string
  label: string
  description?: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}

export function SelectSetting({
  id,
  label,
  description,
  value,
  options,
  onChange,
}: SelectSettingProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground/80">{description}</p>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
