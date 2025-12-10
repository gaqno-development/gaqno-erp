import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui'
import { formatCurrency } from '../utils/formatCurrency'
import { ICreditCardSummary } from '../types/finance'

interface ICreditCardSummaryProps {
  summary: ICreditCardSummary
}

export function CreditCardSummary({ summary }: ICreditCardSummaryProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-lg">Resumo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(summary.monthlyValue)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Somatório das despesas lançadas
          </p>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(summary.remainingLimit)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Limite Restante
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

