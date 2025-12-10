import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'

interface IIncomeCardProps {
  total: number
}

export function IncomeCard({ total }: IIncomeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Receitas</CardTitle>
        <TrendingUp className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-emerald-600">
          {formatCurrency(total)}
        </p>
      </CardContent>
    </Card>
  )
}

