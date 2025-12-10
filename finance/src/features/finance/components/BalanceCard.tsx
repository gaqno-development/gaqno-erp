import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui'
import { Wallet } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'

interface IBalanceCardProps {
  total: number
  invested: number
  available: number
}

export function BalanceCard({ total, invested, available }: IBalanceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Balanço Total</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-emerald-600">
          {formatCurrency(total)}
        </p>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div>Investido: {formatCurrency(invested)}</div>
          <div>Saldo Disponível: {formatCurrency(available)}</div>
        </div>
      </CardContent>
    </Card>
  )
}

