'use client'

import { IFinanceTransaction } from '../types/finance'
import { cn } from '@repo/core/lib/utils'
import { getTransactionIcon } from './TransactionIconPicker'

interface ITransactionIconProps {
  transaction: IFinanceTransaction
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const DEFAULT_COLORS = {
  income: '#10B981',
  expense: '#EF4444',
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

const ICON_SIZE_CLASSES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

function TransactionIcon({ transaction, size = 'md', className, onClick }: ITransactionIconProps) {
  const backgroundColor = transaction.category?.color || DEFAULT_COLORS[transaction.type]
  
  const subcategoryIcon = transaction.subcategory?.icon
  const categoryIcon = transaction.category?.icon
  const displayIcon = subcategoryIcon || categoryIcon || transaction.icon
  const LucideIcon = displayIcon ? getTransactionIcon(displayIcon) : null
  const defaultIcon = transaction.type === 'income' ? '💰' : '💸'

  if (displayIcon && !LucideIcon) {
    console.warn(`Transaction icon "${displayIcon}" not found in icon map`)
  }

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
        SIZE_CLASSES[size],
        onClick && 'cursor-pointer hover:opacity-80 hover:scale-105',
        className
      )}
      style={{
        backgroundColor: backgroundColor,
        color: '#FFFFFF',
      }}
      title={transaction.subcategory?.name || transaction.category?.name || transaction.description}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {LucideIcon ? (
        <LucideIcon className={ICON_SIZE_CLASSES[size]} />
      ) : (
        <span className="leading-none text-lg">
          {categoryIcon || defaultIcon}
        </span>
      )}
    </div>
  )
}

export { TransactionIcon }
