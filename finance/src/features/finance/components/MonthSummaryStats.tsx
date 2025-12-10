'use client'

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'

interface IMonthSummaryStatsProps {
  monthIncome: number
  monthExpenses: number
  monthBalance: number
  variant?: 'desktop' | 'mobile'
}

export function MonthSummaryStats({
  monthIncome,
  monthExpenses,
  monthBalance,
  variant = 'desktop',
}: IMonthSummaryStatsProps) {
  const containerClassName =
    variant === 'desktop'
      ? 'hidden md:flex items-center gap-4 ml-auto text-xs'
      : 'md:hidden flex items-center gap-4 mt-2 ml-6 text-xs'

  return (
    <div className={containerClassName}>
      <div className="flex items-center gap-1">
        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
        <span className="font-medium text-green-600">{formatCurrency(monthIncome)}</span>
      </div>
      <div className="flex items-center gap-1">
        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
        <span className="font-medium text-red-600">{formatCurrency(monthExpenses)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Wallet className={`h-3.5 w-3.5 ${monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`font-semibold ${monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(monthBalance)}
        </span>
      </div>
    </div>
  )
}

