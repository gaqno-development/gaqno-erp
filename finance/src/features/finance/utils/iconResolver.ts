import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

const iconCache = new Map<string, LucideIcon>()

export function getIconComponent(iconName: string | null | undefined): LucideIcon | null {
  if (!iconName) return null

  if (iconCache.has(iconName)) {
    return iconCache.get(iconName) || null
  }

  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
  
  if (IconComponent) {
    iconCache.set(iconName, IconComponent)
    return IconComponent
  }

  return null
}

