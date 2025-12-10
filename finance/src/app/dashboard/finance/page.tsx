'use client'

import { useState } from 'react'
import { BalanceCard } from '@/features/finance/components/BalanceCard'
import { IncomeCard } from '@/features/finance/components/IncomeCard'
import { ExpenseCard } from '@/features/finance/components/ExpenseCard'
import { CategoryExpensesBarChart } from '@/features/finance/components/CategoryExpensesBarChart'
import { MonthlySummaryBarChart } from '@/features/finance/components/MonthlySummaryBarChart'
import { CreditCardOverview } from '@/features/finance/components/CreditCardOverview'
import { CreditCardSummary } from '@/features/finance/components/CreditCardSummary'
import { IncomeExpenseView } from '@/features/finance/components/IncomeExpenseView'
import { Card, CardContent } from '@repo/ui/components/ui'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceSummary'
import { useTransactions } from '@/features/finance/hooks/useTransactions'
import { useCreditCards, useCreditCardSummary } from '@/features/finance/hooks/useCreditCards'

export default function FinancePage() {
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const { summary, isLoading: summaryLoading } = useFinanceSummary(startDate, endDate)
  const {
    transactions,
    isLoading: transactionsLoading,
    deleteTransaction,
  } = useTransactions(startDate, endDate)
  const { creditCards } = useCreditCards()
  const { data: cardSummary } = useCreditCardSummary(selectedCardId, startDate, endDate)

  const handleDelete = async (transactionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      const result = await deleteTransaction(transactionId)
      if (!result.success) {
        alert(`Erro ao deletar: ${result.error}`)
      }
    }
  }

  if (summaryLoading || transactionsLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Finanças</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas receitas, despesas e acompanhe seu balanço
          </p>
        </div>
      </div>

      {creditCards.length > 0 && (
        <div className="space-y-4">
          <CreditCardOverview
            onCardSelect={setSelectedCardId}
            selectedCardId={selectedCardId}
          />
          {selectedCardId && cardSummary && (
            <CreditCardSummary summary={cardSummary} />
          )}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <BalanceCard
          total={summary.totalBalance}
          invested={summary.invested}
          available={summary.availableBalance}
        />
        <IncomeCard total={summary.totalIncome} />
        <ExpenseCard total={summary.totalExpenses} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseView
            transactions={transactions}
            onDelete={handleDelete}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <CategoryExpensesBarChart transactions={transactions} />
          <MonthlySummaryBarChart transactions={transactions} />
        </div>
      </div>
    </div>
  )
}

