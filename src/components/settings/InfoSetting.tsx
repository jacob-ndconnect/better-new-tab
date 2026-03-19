import { Kbd } from "@/components/ui/kbd"

type InfoSettingProps = {
  label: string
  description: string
  value: string
}

export function InfoSetting({ label, description, value }: InfoSettingProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <p className="text-xs text-muted-foreground/80">{description}</p>
      <div className="flex min-h-8 items-center gap-1 rounded border border-input bg-muted/30 px-2.5">
        <Kbd className="rounded">{value}</Kbd>
      </div>
    </div>
  )
}
