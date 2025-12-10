'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/components/ui'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@repo/ui/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/ui'
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, Plus, Filter, Maximize2, Eye, Edit, Trash2 } from 'lucide-react'
import { IFinanceTransaction } from '../types/finance'
import { formatCurrency } from '../utils/formatCurrency'
import { AddTransactionDialog } from './AddTransactionDialog'
import { TransactionIcon } from './TransactionIcon'
import { generateRecurringTransactions } from '../utils/generateRecurringTransactions'
import { useTransactions } from '../hooks/useTransactions'
import { TransactionStatus } from '../types/finance'
import { useCategories } from '../hooks/useCategories'
import { RecurringBadge } from './RecurringBadge'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { MonthSummaryStats } from './MonthSummaryStats'
import { CategoryBadge } from './CategoryBadge'
import { QuarterFilterButtons } from './QuarterFilterButtons'
import { YearFilterButtons } from './YearFilterButtons'

interface IIncomeExpenseViewProps {
  transactions: IFinanceTransaction[]
  onDelete: (transactionId: string) => void
}

interface IMonthlyGroup {
  month: string
  year: number
  monthIndex: number
  yearMonth: string
  transactions: IFinanceTransaction[]
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const getCurrentQuarter = () => {
  const month = new Date().getMonth()
  if (month >= 0 && month <= 2) return 'q1'
  if (month >= 3 && month <= 5) return 'q2'
  if (month >= 6 && month <= 8) return 'q3'
  return 'q4'
}

export function IncomeExpenseView({ transactions, onDelete }: IIncomeExpenseViewProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter())
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
  const [editingTransaction, setEditingTransaction] = useState<IFinanceTransaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [detailsTransaction, setDetailsTransaction] = useState<IFinanceTransaction | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const { updateTransaction } = useTransactions()
  const { categories } = useCategories()

  const handleViewDetails = (transaction: IFinanceTransaction) => {
    setDetailsTransaction(transaction)
    setIsDetailsDialogOpen(true)
  }

  const handleEdit = (transaction: IFinanceTransaction) => {
    if (transaction.id.includes('-generated-')) {
      alert('Esta é uma transação futura gerada automaticamente. Para editá-la, edite a transação recorrente original.')
      return
    }
    setEditingTransaction(transaction)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (transaction: IFinanceTransaction) => {
    if (transaction.id.includes('-generated-')) {
      alert('Esta é uma transação futura gerada automaticamente. Para removê-la, desative a recorrência na transação original.')
      return
    }
    if (confirm(`Tem certeza que deseja excluir "${transaction.description}"?`)) {
      await onDelete(transaction.id)
    }
  }

  const getTransactionStatus = (transaction: IFinanceTransaction): TransactionStatus => {
    if (transaction.status === TransactionStatus.PAGO) {
      return TransactionStatus.PAGO
    }

    if (transaction.due_date && transaction.type === 'expense') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dueDate = new Date(transaction.due_date)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        return TransactionStatus.EM_ATRASO
      }
    }

    return transaction.status || TransactionStatus.A_PAGAR
  }

  const handleToggleStatus = async (transaction: IFinanceTransaction) => {
    if (transaction.id.includes('-generated-')) {
      alert('Esta é uma transação futura gerada automaticamente. Para alterar o status, edite a transação recorrente original.')
      return
    }

    const currentStatus = getTransactionStatus(transaction)
    let newStatus: TransactionStatus

    if (currentStatus === TransactionStatus.A_PAGAR || currentStatus === TransactionStatus.EM_ATRASO) {
      newStatus = TransactionStatus.PAGO
    } else {
      newStatus = TransactionStatus.A_PAGAR
    }

    const result = await updateTransaction({
      id: transaction.id,
      status: newStatus,
    })

    if (!result.success) {
      alert('Erro ao atualizar status: ' + result.error)
    }
  }

  const allTransactions = useMemo(
    () => generateRecurringTransactions(transactions, 12),
    [transactions]
  )

  useEffect(() => {
    const updateOverdueTransactions = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const overdueTransactions = transactions.filter((transaction) => {
        if (transaction.id.includes('-generated-')) return false
        if (transaction.status === TransactionStatus.PAGO) return false
        if (transaction.type !== 'expense') return false
        if (!transaction.due_date) return false

        const dueDate = new Date(transaction.due_date)
        dueDate.setHours(0, 0, 0, 0)

        return dueDate < today && transaction.status !== TransactionStatus.EM_ATRASO
      })

      if (overdueTransactions.length > 0) {
        for (const transaction of overdueTransactions) {
          await updateTransaction({
            id: transaction.id,
            status: TransactionStatus.EM_ATRASO,
          })
        }
      }
    }

    updateOverdueTransactions()
  }, [transactions, updateTransaction])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    allTransactions.forEach((t) => {
      years.add(new Date(t.transaction_date).getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [allTransactions])

  const filterByQuarter = (transactions: IFinanceTransaction[]) => {
    if (selectedQuarter === 'all') return transactions

    const quarterMonths: Record<string, number[]> = {
      q1: [0, 1, 2], // Jan, Feb, Mar
      q2: [3, 4, 5], // Apr, May, Jun
      q3: [6, 7, 8], // Jul, Aug, Sep
      q4: [9, 10, 11], // Oct, Nov, Dec
    }

    const months = quarterMonths[selectedQuarter]
    if (!months) return transactions

    return transactions.filter((t) => {
      const date = new Date(t.transaction_date)
      return months.includes(date.getMonth())
    })
  }

  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions

    filtered = filtered.filter((t) => {
      const date = new Date(t.transaction_date)
      return date.getFullYear() === selectedYear
    })

    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.type === selectedType)
    }
    return filterByQuarter(filtered)
  }, [allTransactions, selectedType, selectedQuarter, selectedYear])

  const groupByMonth = (transactions: IFinanceTransaction[]): IMonthlyGroup[] => {
    const groups: Record<string, IFinanceTransaction[]> = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_date)
      const year = date.getFullYear()
      const monthIndex = date.getMonth()
      const yearMonth = `${year}-${monthIndex}`

      if (!groups[yearMonth]) {
        groups[yearMonth] = []
      }
      groups[yearMonth].push(transaction)
    })

    return Object.entries(groups)
      .map(([yearMonth, transactions]) => {
        const [year, monthIndex] = yearMonth.split('-').map(Number)
        return {
          month: MONTHS[monthIndex],
          year,
          monthIndex,
          yearMonth,
          transactions: transactions.sort((a, b) =>
            new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
          ),
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.monthIndex - a.monthIndex
      })
  }

  const transactionGroups = useMemo(() => groupByMonth(filteredTransactions), [filteredTransactions])

  const toggleMonth = (yearMonth: string) => {
    setOpenMonths((prev) => ({
      ...prev,
      [yearMonth]: !prev[yearMonth],
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }


  const renderCategoryIcon = (transaction: IFinanceTransaction) => {
    return (
      <TransactionIcon
        transaction={transaction}
        size="sm"
      />
    )
  }

  const renderTransactionTable = (groups: IMonthlyGroup[]) => {
    if (groups.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma transação registrada
        </div>
      )
    }

    return (
      <div className="space-y-4 md:space-y-3">
        {groups.map((group) => {
          const isOpen = openMonths[group.yearMonth] !== false

          const monthIncome = group.transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          const monthExpenses = group.transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          const monthBalance = monthIncome - monthExpenses

          return (
            <Collapsible
              key={group.yearMonth}
              open={isOpen}
              onOpenChange={() => toggleMonth(group.yearMonth)}
              className="border border-border rounded-lg bg-card shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger className="w-full">
                <div className="px-4 py-3 md:py-2 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-semibold text-base md:text-sm">{group.month} {group.year}</span>
                    <MonthSummaryStats
                      monthIncome={monthIncome}
                      monthExpenses={monthExpenses}
                      monthBalance={monthBalance}
                      variant="desktop"
                    />
                    <span className="text-sm text-muted-foreground ml-auto md:ml-0">
                      {group.transactions.length}
                    </span>
                  </div>
                  <MonthSummaryStats
                    monthIncome={monthIncome}
                    monthExpenses={monthExpenses}
                    monthBalance={monthBalance}
                    variant="mobile"
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up transition-all duration-300 ease-out">
                <div className="mt-2 pb-2">
                  <div className="hidden md:grid grid-cols-[2fr,150px,120px,160px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      <span>Nome</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span>Valor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Tags</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Date</span>
                    </div>
                  </div>
                  {group.transactions.map((transaction) => (
                    <div key={transaction.id}>
                      <div className="md:hidden px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {renderCategoryIcon(transaction)}
                            <span className="font-medium text-sm">{transaction.description}</span>
                          </div>
                          <div className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center text-xs">
                          {transaction.category && (
                            <CategoryBadge 
                              category={transaction.category} 
                              subcategory={transaction.subcategory}
                            />
                          )}
                          {transaction.type === 'expense' && (
                            <TransactionStatusBadge
                              status={getTransactionStatus(transaction)}
                              onClick={(e) => {
                                e?.stopPropagation()
                                handleToggleStatus(transaction)
                              }}
                            />
                          )}
                          <RecurringBadge transaction={transaction} />
                          <span className="text-muted-foreground ml-auto">
                            {formatDate(transaction.transaction_date)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(transaction)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div
                            className="hidden md:grid grid-cols-[2fr,150px,120px,160px] gap-4 px-4 py-3 hover:bg-muted/50 transition-colors text-sm border-b last:border-0 cursor-context-menu"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                              {renderCategoryIcon(transaction)}
                              <span className="font-medium truncate">{transaction.description}</span>
                              {transaction.type === 'expense' && (
                                <TransactionStatusBadge
                                  status={getTransactionStatus(transaction)}
                                  onClick={(e) => {
                                    e?.stopPropagation()
                                    handleToggleStatus(transaction)
                                  }}
                                />
                              )}
                              <RecurringBadge transaction={transaction} className="text-xs flex-shrink-0" />
                            </div>
                            <div className={`font-semibold text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="flex gap-1 flex-wrap items-center">
                              {transaction.category && (
                                <CategoryBadge 
                                  category={transaction.category} 
                                  subcategory={transaction.subcategory}
                                  size="sm" 
                                />
                              )}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {formatDate(transaction.transaction_date)}
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleViewDetails(transaction)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleEdit(transaction)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })
        }
      </div >
    )
  }

  const getDefaultTypeForNew = (): 'income' | 'expense' => {
    if (selectedType === 'income') return 'income'
    if (selectedType === 'expense') return 'expense'
    return 'expense'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedType === 'income' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setSelectedType('income')}
                >
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Income
                </Button>
                <Button
                  variant={selectedType === 'expense' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setSelectedType('expense')}
                >
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Expenses
                </Button>
              </div>
              <QuarterFilterButtons
                selectedQuarter={selectedQuarter}
                onQuarterChange={setSelectedQuarter}
                variant="desktop"
              />
              <YearFilterButtons
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                variant="desktop"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <QuarterFilterButtons
                selectedQuarter={selectedQuarter}
                onQuarterChange={setSelectedQuarter}
                variant="mobile"
              />
              <YearFilterButtons
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                variant="mobile"
              />
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsNewDialogOpen(true)}
              >
                <span className="hidden md:inline">New</span>
                <Plus className="h-4 w-4 md:hidden" />
                <ChevronDown className="h-4 w-4 ml-1 hidden md:inline" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderTransactionTable(transactionGroups)}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        defaultType={getDefaultTypeForNew()}
        onClose={() => setIsNewDialogOpen(false)}
      />

      <AddTransactionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        transaction={editingTransaction}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingTransaction(null)
        }}
      />


      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a transação
            </DialogDescription>
          </DialogHeader>
          {detailsTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-base">{detailsTransaction.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-base">
                    {detailsTransaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p className={`text-base font-semibold ${detailsTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(detailsTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data</p>
                  <p className="text-base">{formatDate(detailsTransaction.transaction_date)}</p>
                </div>
                {detailsTransaction.due_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Vencimento</p>
                    <p className="text-base">{formatDate(detailsTransaction.due_date)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-base capitalize">{detailsTransaction.status.replace('_', ' ')}</p>
                </div>
                {detailsTransaction.category && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <p className="text-base">{detailsTransaction.category.name}</p>
                  </div>
                )}
                {detailsTransaction.creditCard && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cartão de Crédito</p>
                    <p className="text-base">
                      {detailsTransaction.creditCard.name} - Final {detailsTransaction.creditCard.last_four_digits}
                    </p>
                  </div>
                )}
                {detailsTransaction.is_recurring && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recorrência</p>
                    <p className="text-base">
                      <RecurringBadge transaction={detailsTransaction} variant="text" />
                    </p>
                  </div>
                )}
                {detailsTransaction.installment_count > 1 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
                    <p className="text-base">
                      {detailsTransaction.installment_current} de {detailsTransaction.installment_count}
                    </p>
                  </div>
                )}
                {detailsTransaction.assigned_to && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Corresponde a</p>
                    <p className="text-base">{detailsTransaction.assigned_to}</p>
                  </div>
                )}
              </div>
              {detailsTransaction.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anotações</p>
                  <p className="text-base">{detailsTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

