'use client'

import * as React from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface IIncomeBreakdownChartProps {
  transactions: IFinanceTransaction[]
}

export function IncomeBreakdownChart({
  transactions,
}: IIncomeBreakdownChartProps) {
  const incomeTransactions = transactions.filter((t) => t.type === 'income')

  const categoryData = React.useMemo(() => {
    return incomeTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.subcategory?.name || transaction.category?.name || 'Sem categoria'
      const categoryColor = transaction.category?.color || '#10B981'
      const categoryIcon = transaction.subcategory?.icon || transaction.category?.icon || null
      const existing = acc.find((item) => item.name === categoryName)

      if (existing) {
        existing.value += Number(transaction.amount)
      } else {
        acc.push({
          name: categoryName,
          value: Number(transaction.amount),
          color: categoryColor,
          icon: categoryIcon,
        })
      }

      return acc
    }, [] as Array<{ name: string; value: number; color: string; icon: string | null }>)
  }, [incomeTransactions])

  const totalIncome = React.useMemo(() => {
    return categoryData.reduce((acc, curr) => acc + curr.value, 0)
  }, [categoryData])

  const chartData = React.useMemo(() => {
    return categoryData.map((item, index) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '_')
      return {
        category: item.name,
        amount: item.value,
        categoryKey: key,
        color: item.color,
      }
    })
  }, [categoryData])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: 'Valor',
      },
    }

    categoryData.forEach((item) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '_')
      const IconComponent = item.icon 
        ? (props: any) => <EmojiIcon emoji={item.icon!} {...props} />
        : undefined
      
      config[key] = {
        label: item.name,
        color: item.color,
        icon: IconComponent,
      }
    })

    return config
  }, [categoryData])

  if (categoryData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Receitas por Categoria</CardTitle>
          <CardDescription>Distribuição das receitas por categoria</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Nenhuma receita registrada
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Receitas por Categoria</CardTitle>
        <CardDescription>Distribuição das receitas por categoria</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => {
                return (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                )
              })}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCurrency(totalIncome)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          {categoryData.length} {categoryData.length === 1 ? 'categoria' : 'categorias'}
        </div>
      </CardFooter>
    </Card>
  )
}
