import type { ComponentType, ElementType } from "react"
import { GearIcon, HeartIcon, PaintBrushIcon } from "@phosphor-icons/react"
import type { Settings } from "@/types"
import { SupportSectionContent } from "./SupportSection"

//IMAGES
import devAvatar from "@/assets/me_and_meebo.jpg"

const SECTION_LABEL_SIZE_OPTIONS = [
  { value: "text-xs", label: "Extra small" },
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Base" },
  { value: "text-lg", label: "Large" },
  { value: "text-xl", label: "Extra large" },
  { value: "text-2xl", label: "2XL" },
  { value: "text-3xl", label: "3XL" },
] as const

export type SettingConfig = {
  id: keyof Settings
  label: string
  description?: string
  type: "hotkey" | "select"
  options?: readonly { value: string; label: string }[]
}

export type SupportLink = {
  label: string
  url: string
}

export type SupportSectionConfig = {
  avatar: string
  buyMeACoffee: string
  links: SupportLink[]
}

export type SettingsSection = {
  id: string
  label: string
  icon?: ElementType
  settings?: SettingConfig[]
  Content?: ComponentType
}

// Support section config — update with your details
export const SUPPORT_CONFIG: SupportSectionConfig = {
  avatar: devAvatar, // Add your photo to public/dev-avatar.png
  buyMeACoffee: "https://buymeacoffee.com/jacobestep",
  links: [
    { label: "GitHub", url: "https://github.com/jacob-ndconnect" },
    { label: "Twitter", url: "https://x.com/jacob_estep_dev" },
    { label: "Portfolio", url: "https://jacobestep.com/" },
  ],
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "general",
    label: "General",
    icon: GearIcon,
    settings: [
      {
        id: "searchShortcut",
        label: "Search shortcut",
        description: "Keyboard shortcut to open search",
        type: "hotkey",
      },
    ],
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: PaintBrushIcon,
    settings: [
      {
        id: "sectionLabelSize",
        label: "Section label size",
        description: "Font size for section headers in canvas",
        type: "select",
        options: SECTION_LABEL_SIZE_OPTIONS,
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: HeartIcon,
    Content: SupportSectionContent,
  },
]
