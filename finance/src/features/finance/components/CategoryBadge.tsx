'use client'

import { IFinanceCategory, IFinanceSubcategory } from '../types/finance'
import { getTransactionIcon } from './TransactionIconPicker'

interface ICategoryBadgeProps {
  category: IFinanceCategory
  subcategory?: IFinanceSubcategory | null
  size?: 'sm' | 'md'
  className?: string
}

const hexToRgba = (hex: string, alpha: number = 0.2) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function CategoryBadge({ category, subcategory, size = 'md', className = '' }: ICategoryBadgeProps) {
  const baseClassName = size === 'sm'
    ? 'text-xs px-2 py-1 rounded whitespace-nowrap flex items-center gap-1 font-medium'
    : 'px-2 py-1 rounded flex items-center gap-1 font-medium'

  const color = category.color || '#3B82F6'
  const displayName = subcategory?.name || category.name
  const displayIcon = subcategory?.icon || category.icon
  const IconComponent = displayIcon ? getTransactionIcon(displayIcon) : null

  return (
    <span
      className={`${baseClassName} ${className}`}
      style={{
        backgroundColor: hexToRgba(color, 0.15),
        color: color,
      }}
    >
      {IconComponent && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {displayName}
    </span>
  )
}

