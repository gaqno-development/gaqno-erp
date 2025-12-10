'use client'

import { RefreshCw } from 'lucide-react'
import { IFinanceTransaction } from '../types/finance'

interface IRecurringBadgeProps {
  transaction: IFinanceTransaction
  variant?: 'badge' | 'text'
  className?: string
}

const getRecurringTypeLabel = (transaction: IFinanceTransaction): string => {
  if (transaction.recurring_type === 'fifth_business_day') return '(5º dia útil)'
  if (transaction.recurring_type === 'day_15') return '(dia 15)'
  if (transaction.recurring_type === 'last_day') return '(fim do mês)'
  if (transaction.recurring_day) return `(dia ${transaction.recurring_day})`
  return ''
}

const getRecurringTypeText = (transaction: IFinanceTransaction): string => {
  if (transaction.recurring_type === 'fifth_business_day') return 'Quinto dia útil do mês'
  if (transaction.recurring_type === 'day_15') return 'Todo dia 15'
  if (transaction.recurring_type === 'last_day') return 'Final do mês'
  if (transaction.recurring_type === 'custom' && transaction.recurring_day) {
    return `Todo dia ${transaction.recurring_day} do mês`
  }
  if (transaction.recurring_day) {
    return `Todo dia ${transaction.recurring_day} do mês`
  }
  return ''
}

export function RecurringBadge({ transaction, variant = 'badge', className = '' }: IRecurringBadgeProps) {
  if (!transaction.is_recurring) return null

  if (variant === 'text') {
    const text = getRecurringTypeText(transaction)
    return text ? <span>{text}</span> : null
  }

  const label = transaction.id.includes('-generated-') ? 'Auto' : 'Recorrente'
  const typeLabel = getRecurringTypeLabel(transaction)

  return (
    <span className={`bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1 ${className}`}>
      <RefreshCw className="w-3 h-3" />
      <span className="hidden md:inline">
        {label} {typeLabel}
      </span>
    </span>
  )
}

