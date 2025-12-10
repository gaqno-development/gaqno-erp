import { TransactionStatus as TransactionStatusType } from '../types/finance'
import { TransactionStatus } from '../types/finance'

interface ITransactionStatusBadgeProps {
  status: TransactionStatusType
  onClick?: (e?: React.MouseEvent) => void
}

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  [TransactionStatus.PAGO]: {
    label: 'Pago',
    className: 'bg-green-100 text-green-700',
  },
  [TransactionStatus.A_PAGAR]: {
    label: 'A pagar',
    className: 'bg-blue-100 text-blue-700',
  },
  [TransactionStatus.EM_ATRASO]: {
    label: 'Em atraso',
    className: 'bg-red-100 text-red-700',
  },
}

export function TransactionStatusBadge({ status, onClick }: ITransactionStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-all ${config.className} ${onClick ? 'cursor-pointer hover:opacity-80 hover:scale-105' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {config.label}
    </span>
  )
}

