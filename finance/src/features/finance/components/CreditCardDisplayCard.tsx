import { Card, CardContent } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Trash2, Edit } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'
import { ICreditCard } from '../types/finance'

interface ICreditCardDisplayCardProps {
  card: ICreditCard
  onDelete?: (cardId: string) => void
  onClick?: (cardId: string) => void
  onEdit?: (card: ICreditCard) => void
}

export function CreditCardDisplayCard({
  card,
  onDelete,
  onClick,
  onEdit,
}: ICreditCardDisplayCardProps) {
  const cardStyle = {
    backgroundColor: card.color,
    backgroundImage: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
  }

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
      style={cardStyle}
      onClick={() => onClick?.(card.id)}
    >
      <CardContent className="p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            {card.icon && (
              <div className="text-2xl mb-2">{card.icon}</div>
            )}
            <h3 className="text-xl font-bold">{card.name}</h3>
            <p className="text-sm opacity-90">
              Final {card.last_four_digits} - {card.card_type}
            </p>
            {card.bank_name && (
              <p className="text-xs opacity-75 mt-1">{card.bank_name}</p>
            )}
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(card)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(card.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="opacity-90">Limite:</span>
            <span className="font-semibold">{formatCurrency(card.credit_limit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-90">Fechamento:</span>
            <span className="font-semibold">Dia {card.closing_day}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-90">Vencimento:</span>
            <span className="font-semibold">Dia {card.due_day}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

