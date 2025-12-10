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
import { formatCurrency } from '../utils/formatCurrency'
import { ICategoryExpense } from '../types/finance'

interface ICategoryChartProps {
  data: ICategoryExpense[]
}

export function CategoryChart({ data }: ICategoryChartProps) {
  const totalExpenses = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0)
  }, [data])

  const chartData = React.useMemo(() => {
    return data.map((item, index) => {
      const key = item.category.toLowerCase().replace(/\s+/g, '_')
      return {
        category: item.category,
        amount: item.amount,
        categoryKey: key,
      }
    })
  }, [data])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: 'Valor',
      },
    }

    data.forEach((item, index) => {
      const key = item.category.toLowerCase().replace(/\s+/g, '_')
      config[key] = {
        label: item.category,
        color: item.color || `var(--chart-${(index % 5) + 1})`,
      }
    })

    return config
  }, [data])

  if (data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição das despesas por categoria</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Nenhuma despesa registrada
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Distribuição das despesas por categoria</CardDescription>
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
                const color = data[index]?.color || `var(--chart-${(index % 5) + 1})`
                return (
                  <Cell key={`cell-${index}`} fill={color} />
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
                          {formatCurrency(totalExpenses)}
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
          {data.length} {data.length === 1 ? 'categoria' : 'categorias'}
        </div>
      </CardFooter>
    </Card>
  )
}
