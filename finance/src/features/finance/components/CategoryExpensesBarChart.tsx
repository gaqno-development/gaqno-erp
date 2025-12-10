'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { TrendingDown } from 'lucide-react'
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
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/ui'
import { IFinanceTransaction } from '../types/finance'
import { formatCurrency } from '../utils/formatCurrency'
import { EmojiIcon } from './EmojiIcon'

interface ICategoryExpensesBarChartProps {
  transactions: IFinanceTransaction[]
}

export function CategoryExpensesBarChart({
  transactions,
}: ICategoryExpensesBarChartProps) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const expenseTransactions = transactions.filter((t) => t.type === 'expense')

  const categoryData = React.useMemo(() => {
    const categoryMap = new Map<
      string,
      { amount: number; color: string; icon: string | null }
    >()

    expenseTransactions.forEach((transaction) => {
      const categoryName = transaction.subcategory?.name || transaction.category?.name || 'Sem categoria'
      const color = transaction.category?.color || '#3B82F6'
      const icon = transaction.subcategory?.icon || transaction.category?.icon || null
      const amount = Number(transaction.amount)

      const existing = categoryMap.get(categoryName)
      if (existing) {
        existing.amount += amount
      } else {
        categoryMap.set(categoryName, { amount, color, icon })
      }
    })

    return Array.from(categoryMap.entries())
      .map(([category, { amount, color, icon }]) => ({
        category,
        amount,
        color,
        icon,
        categoryKey: category.toLowerCase().replace(/\s+/g, '_'),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenseTransactions])

  const chartData = React.useMemo(() => {
    return categoryData.map((item) => ({
      category: item.category,
      amount: item.amount,
      fill: item.color,
      categoryKey: item.categoryKey,
      icon: item.icon,
    }))
  }, [categoryData])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: 'Valor',
      },
    }

    categoryData.forEach((item) => {
      const IconComponent = item.icon 
        ? (props: any) => <EmojiIcon emoji={item.icon!} {...props} />
        : TrendingDown
      
      config[item.categoryKey] = {
        label: item.category,
        color: item.color,
        icon: IconComponent,
      }
    })

    return config
  }, [categoryData])

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição das despesas por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] md:h-[300px] text-muted-foreground">
            Nenhuma despesa registrada
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">Despesas por Categoria</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Distribuição das despesas por categoria
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <ChartContainer config={chartConfig} className="h-[200px] md:h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={isMobile ? 60 : 100}
              tickFormatter={(value) => {
                const maxLength = isMobile ? 8 : 15
                const truncated = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
                return truncated
              }}
              className="text-xs md:text-sm"
            />
            <XAxis dataKey="amount" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="categoryKey"
                  formatter={(value, name, item) => {
                    const payloadData = (item.payload as Record<string, unknown>) || {}
                    const categoryKey = (payloadData.categoryKey as string) || name
                    const categoryConfig = chartConfig[categoryKey]
                    const IconComponent = categoryConfig?.icon
                    const categoryName = categoryConfig?.label || (payloadData.category as string) || name
                    const fillColor = (payloadData.fill as string) || categoryConfig?.color || '#3B82F6'
                    
                    return (
                      <div className="flex w-full flex-wrap items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
                        {IconComponent ? (
                          <IconComponent />
                        ) : (
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: fillColor,
                            }}
                          />
                        )}
                        <div className="flex flex-1 justify-between items-center leading-none">
                          <span className="text-muted-foreground">
                            {categoryName}
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground ml-4">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey="amount" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

