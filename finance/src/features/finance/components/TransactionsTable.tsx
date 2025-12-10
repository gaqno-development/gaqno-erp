'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui'
import { Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils/formatCurrency'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { TransactionIcon } from './TransactionIcon'
import { IFinanceTransaction } from '../types/finance'
import { AddTransactionDialog } from './AddTransactionDialog'
import { RecurringBadge } from './RecurringBadge'

interface ITransactionsTableProps {
  transactions: IFinanceTransaction[]
  onDelete: (transactionId: string) => void
}

export function TransactionsTable({
  transactions,
  onDelete,
}: ITransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<IFinanceTransaction | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (transaction: IFinanceTransaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>Adicionar Transação</Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma transação registrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <TransactionIcon transaction={transaction} size="sm" />
                        <span>{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.subcategory?.name || transaction.category?.name || 'Sem categoria'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium w-fit ${
                            transaction.type === 'income'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                        {transaction.status && (
                          <TransactionStatusBadge status={transaction.status} />
                        )}
                        <RecurringBadge transaction={transaction} className="text-xs w-fit" />
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={editingTransaction}
        onClose={handleClose}
      />
    </>
  )
}

