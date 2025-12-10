'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardContent } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { TrendingUp } from 'lucide-react'
import { IFinanceTransaction } from '../types/finance'
import { formatCurrency } from '../utils/formatCurrency'
import { generateRecurringTransactions } from '../utils/generateRecurringTransactions'
import { QuarterFilterButtons } from './QuarterFilterButtons'

interface ITotalSavingsChartProps {
  transactions: IFinanceTransaction[]
}

interface IMonthSummary {
  month: string
  income: number
  expenses: number
  net: number
  color: string
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const MONTH_COLORS: Record<string, string> = {
  Janeiro: 'bg-blue-500',
  Fevereiro: 'bg-blue-500',
  Março: 'bg-blue-500',
  Abril: 'bg-green-500',
  Maio: 'bg-green-500',
  Junho: 'bg-green-500',
  Julho: 'bg-yellow-500',
  Agosto: 'bg-yellow-500',
  Setembro: 'bg-yellow-500',
  Outubro: 'bg-gray-500',
  Novembro: 'bg-red-500',
  Dezembro: 'bg-red-500',
}

export function TotalSavingsChart({ transactions }: ITotalSavingsChartProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all')
  
  const allTransactions = useMemo(
    () => generateRecurringTransactions(transactions, 12),
    [transactions]
  )

  const monthlyData = useMemo(() => {
    const data: IMonthSummary[] = []

    MONTHS.forEach((month, index) => {
      const monthTransactions = allTransactions.filter((t) => {
        const date = new Date(t.transaction_date)
        return date.getMonth() === index
      })

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      data.push({
        month,
        income,
        expenses,
        net: income - expenses,
        color: MONTH_COLORS[month],
      })
    })

    return data
  }, [allTransactions])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <TrendingUp className="h-4 w-4" />
            Total Savings
          </Button>
          <QuarterFilterButtons
            selectedQuarter={selectedQuarter}
            onQuarterChange={setSelectedQuarter}
            variant="desktop"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monthlyData.map((data) => (
            <Card
              key={data.month}
              className="p-4 border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: MONTH_COLORS[data.month].replace('bg-', '#') }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${data.color}`} />
                <h3 className="font-semibold text-sm">{data.month}</h3>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Income:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(data.income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expenses:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(data.expenses)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="text-muted-foreground">Net:</span>
                  <span
                    className={`font-semibold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(data.net)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

