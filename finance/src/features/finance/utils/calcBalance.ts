import { IFinanceTransaction, IFinanceSummary } from '../types/finance'

export function calculateBalance(transactions: IFinanceTransaction[]): IFinanceSummary {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.transaction_date)
    transactionDate.setHours(0, 0, 0, 0)
    return transactionDate <= today
  })

  const totalIncome = currentTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = currentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalBalance = totalIncome - totalExpenses

  const invested = 0
  const availableBalance = totalBalance - invested

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    invested,
    availableBalance,
  }
}

export function calculateCategoryExpenses(transactions: IFinanceTransaction[]): Array<{
  category: string
  amount: number
  percentage: number
  color: string
}> {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

  if (totalExpenses === 0) {
    return []
  }

  const categoryMap = new Map<string, { amount: number; color: string }>()

  expenseTransactions.forEach((transaction) => {
    const categoryName = transaction.subcategory?.name || transaction.category?.name || 'Sem categoria'
    const color = transaction.category?.color || '#3B82F6'
    const amount = Number(transaction.amount)

    const existing = categoryMap.get(categoryName) || { amount: 0, color }
    categoryMap.set(categoryName, {
      amount: existing.amount + amount,
      color,
    })
  })

  return Array.from(categoryMap.entries())
    .map(([category, { amount, color }]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100,
      color,
    }))
    .sort((a, b) => b.amount - a.amount)
}

