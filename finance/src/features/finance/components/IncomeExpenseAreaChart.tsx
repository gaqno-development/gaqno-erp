'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { IFinanceTransaction } from '../types/finance'
import { generateRecurringTransactions } from '../utils/generateRecurringTransactions'
import { formatCurrency } from '../utils/formatCurrency'

interface IIncomeExpenseAreaChartProps {
  transactions: IFinanceTransaction[]
}

const chartConfig = {
  income: {
    label: 'Receitas',
    color: 'var(--chart-1)',
    icon: TrendingUp,
  },
  expense: {
    label: 'Despesas',
    color: 'var(--chart-2)',
    icon: TrendingDown,
  },
} satisfies ChartConfig

export function IncomeExpenseAreaChart({
  transactions,
}: IIncomeExpenseAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState('90d')

  const allTransactions = React.useMemo(
    () => generateRecurringTransactions(transactions, 12),
    [transactions]
  )

  const chartData = React.useMemo(() => {
    const today = new Date()
    const dataMap = new Map<string, { date: string; income: number; expense: number }>()

    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_date)
      const dateKey = date.toISOString().split('T')[0]

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 })
      }

      const entry = dataMap.get(dateKey)!
      if (transaction.type === 'income') {
        entry.income += Number(transaction.amount)
      } else {
        entry.expense += Number(transaction.amount)
      }
    })

    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [allTransactions])

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []

    const referenceDate = new Date(chartData[chartData.length - 1].date)
    let daysToSubtract = 90

    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Receitas e Despesas</CardTitle>
          <CardDescription>
            Evolução das receitas e despesas ao longo do tempo
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Selecione um período"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 dias
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('pt-BR', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="expense"
                type="natural"
                fill="url(#fillExpense)"
                stroke="var(--color-expense)"
                stackId="a"
              />
              <Area
                dataKey="income"
                type="natural"
                fill="url(#fillIncome)"
                stroke="var(--color-income)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

