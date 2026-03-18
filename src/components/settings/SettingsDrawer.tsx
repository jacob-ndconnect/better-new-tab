import { useCallback } from "react"
import { GearIcon, XIcon } from "@phosphor-icons/react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import type { Settings } from "@/types"
import { HotkeySetting } from "./HotkeySetting"

export type SettingConfig = {
  id: keyof Settings
  label: string
  description?: string
  type: "hotkey"
}

const SETTINGS_CONFIG: SettingConfig[] = [
  {
    id: "searchShortcut",
    label: "Search shortcut",
    description: "Keyboard shortcut to open search",
    type: "hotkey",
  },
]

type SettingsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSave: (settings: Settings) => void
}

export function SettingsDrawer({
  open,
  onOpenChange,
  settings,
  onSave,
}: SettingsDrawerProps) {
  const handleSettingChange = useCallback(
    (key: keyof Settings, value: string) => {
      onSave({ ...settings, [key]: value })
    },
    [settings, onSave]
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        className="h-full max-h-none rounded-none border-l"
        dir="ltr"
      >
        <DrawerHeader className="flex flex-row items-center justify-between gap-4">
          <DrawerTitle className="flex items-center gap-2">
            <GearIcon className="size-4" weight="regular" />
            Settings
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Close settings"
            >
              <XIcon className="size-4" weight="bold" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-8">
          {SETTINGS_CONFIG.map((config) => (
            <div key={config.id} className="flex flex-col gap-2">
              {config.type === "hotkey" && (
                <HotkeySetting
                  label={config.label}
                  description={config.description}
                  value={settings[config.id] as string}
                  onChange={(value) => handleSettingChange(config.id, value)}
                />
              )}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
