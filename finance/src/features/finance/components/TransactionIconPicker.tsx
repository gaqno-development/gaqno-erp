'use client'

import { useMemo } from 'react'
import { cn } from '@repo/core/lib/utils'
import { IFinanceCategory } from '../types/finance'
import { getIconComponent } from '../utils/iconResolver'

interface ITransactionIconPickerProps {
  selectedIcon?: string | null
  onSelect: (icon: string) => void
  categories?: IFinanceCategory[]
}

interface IconItem {
  name: string
  component: ReturnType<typeof getIconComponent>
  value: string
  categoryName: string
}

export function TransactionIconPicker({
  selectedIcon,
  onSelect,
  categories = [],
}: ITransactionIconPickerProps) {
  const groupedIcons = useMemo(() => {
    const groups = new Map<string, IconItem[]>()
    const processedIcons = new Set<string>()

    categories.forEach((category) => {
      if (!category.icon) return

      if (processedIcons.has(category.icon)) return
      processedIcons.add(category.icon)

      const IconComponent = getIconComponent(category.icon)
      if (!IconComponent) return

      const categoryName = category.name || 'Outros'

      if (!groups.has(categoryName)) {
        groups.set(categoryName, [])
      }

      groups.get(categoryName)!.push({
        name: category.name,
        component: IconComponent,
        value: category.icon,
        categoryName: category.name,
      })
    })

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [categories])

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {groupedIcons.map(([categoryName, icons]) => (
        <div key={categoryName} className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground px-1">
            {categoryName}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {icons.map((icon) => {
              const IconComponent = icon.component
              const isSelected = selectedIcon === icon.value
              
              if (!IconComponent) return null
              
              return (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => onSelect(icon.value)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-all hover:scale-105',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {icon.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {selectedIcon && (
        <button
          type="button"
          onClick={() => onSelect('')}
          className="w-full text-xs text-muted-foreground hover:text-foreground py-2 text-center"
        >
          Remover ícone selecionado
        </button>
      )}
    </div>
  )
}

export function getTransactionIcon(iconName: string | null | undefined) {
  return getIconComponent(iconName)
}

