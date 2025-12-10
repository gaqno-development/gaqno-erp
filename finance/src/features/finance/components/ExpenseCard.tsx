import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui'
import { TrendingDown } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'

interface IExpenseCardProps {
  total: number
}

export function ExpenseCard({ total }: IExpenseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Despesas</CardTitle>
        <TrendingDown className="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-red-600">
          {formatCurrency(total)}
        </p>
      </CardContent>
    </Card>
  )
}

