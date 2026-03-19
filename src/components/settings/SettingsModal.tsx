import { useCallback } from "react"
import { GearIcon } from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Settings } from "@/types"
import { SETTINGS_SECTIONS } from "./settingsConfig"
import type { SettingConfig } from "./settingsConfig"
import { HotkeySetting } from "./HotkeySetting"
import { SelectSetting } from "./SelectSetting"

type SettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSave: (settings: Settings) => void
}

function renderSetting(
  config: SettingConfig,
  settings: Settings,
  onChange: (key: keyof Settings, value: string) => void
) {
  if (config.type === "hotkey") {
    return (
      <HotkeySetting
        key={config.id}
        label={config.label}
        description={config.description}
        value={settings[config.id] as string}
        onChange={(value) => onChange(config.id, value)}
      />
    )
  }
  if (config.type === "select" && config.options) {
    return (
      <SelectSetting
        key={config.id}
        id={config.id}
        label={config.label}
        description={config.description}
        value={settings[config.id] as string}
        options={config.options}
        onChange={(value) => onChange(config.id, value)}
      />
    )
  }
  return null
}

export function SettingsModal({
  open,
  onOpenChange,
  settings,
  onSave,
}: SettingsModalProps) {
  const handleSettingChange = useCallback(
    (key: keyof Settings, value: string) => {
      onSave({ ...settings, [key]: value })
    },
    [settings, onSave]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] min-h-[min(600px,90vh)] max-w-[560px] flex-col gap-0 p-0 sm:max-w-[720px]"
        showCloseButton={true}
        overlayClassName="bg-black/50 backdrop-blur-sm"
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b px-4 py-3">
          <DialogTitle className="flex items-center gap-2">
            <GearIcon className="size-4" weight="regular" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue={SETTINGS_SECTIONS[0].id}
          orientation="vertical"
          className="flex min-h-0 flex-1"
        >
          <div className="flex min-h-0 flex-1 flex-row">
            <TabsList
              variant="line"
              className="h-auto w-40 shrink-0 flex-col items-stretch justify-start rounded-none border-r bg-transparent p-0"
            >
              {SETTINGS_SECTIONS.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="cursor-pointer justify-start rounded-none border-r-0 px-4 py-2.5 data-[state=active]:border-r-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50"
                >
                  {section.icon && (
                    <section.icon
                      className="size-4 shrink-0"
                      weight="regular"
                    />
                  )}
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {SETTINGS_SECTIONS.map((section) => (
                <TabsContent
                  key={section.id}
                  value={section.id}
                  className="mt-0 flex flex-col gap-6"
                >
                  {section.Content ? (
                    <section.Content />
                  ) : (
                    section.settings?.map((config) =>
                      renderSetting(config, settings, handleSettingChange)
                    )
                  )}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
