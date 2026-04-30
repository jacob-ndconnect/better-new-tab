type BooleanSettingProps = {
  id: string
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function BooleanSetting({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: BooleanSettingProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4 cursor-pointer disabled:cursor-not-allowed"
        />
        <label
          htmlFor={id}
          className={`text-xs font-medium ${disabled ? "cursor-not-allowed text-muted-foreground/60" : "cursor-pointer text-muted-foreground"}`}
        >
          {label}
        </label>
      </div>
      {description && (
        <p className="pl-7 text-xs text-muted-foreground/80">{description}</p>
      )}
    </div>
  )
}
