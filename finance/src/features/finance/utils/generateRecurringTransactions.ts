import { IFinanceTransaction } from '../types/finance'
import { TransactionStatus } from '../types/finance'

export function generateRecurringTransactions(
  transactions: IFinanceTransaction[],
  monthsAhead: number = 12
): IFinanceTransaction[] {
  const generated: IFinanceTransaction[] = [...transactions]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + monthsAhead)
  maxDate.setHours(23, 59, 59, 999)

  const recurringTransactions = transactions.filter((t) => t.is_recurring)

  recurringTransactions.forEach((transaction) => {
    const baseDate = new Date(transaction.transaction_date)
    baseDate.setHours(0, 0, 0, 0)

    const maxMonths = transaction.recurring_months 
      ? Math.min(transaction.recurring_months, monthsAhead)
      : monthsAhead

    let monthOffset = 1

    while (monthOffset <= maxMonths) {
      const generatedDate = getRecurringDate(
        baseDate,
        monthOffset,
        transaction.recurring_type || undefined,
        transaction.recurring_day || undefined
      )
      generatedDate.setHours(0, 0, 0, 0)

      if (generatedDate > maxDate) {
        break
      }

      const generatedDateString = generatedDate.toISOString().split('T')[0]

      const isSameMonthAsOriginal =
        generatedDate.getFullYear() === baseDate.getFullYear() &&
        generatedDate.getMonth() === baseDate.getMonth()

      if (isSameMonthAsOriginal) {
        monthOffset++
        continue
      }

      const alreadyExists = generated.some(
        (t) =>
          t.description === transaction.description &&
          t.transaction_date === generatedDateString &&
          t.type === transaction.type &&
          t.amount === transaction.amount
      )

      if (!alreadyExists) {
        const generatedTransaction: IFinanceTransaction = {
          ...transaction,
          id: `${transaction.id}-generated-${generatedDate.getFullYear()}-${String(generatedDate.getMonth()).padStart(2, '0')}-${String(generatedDate.getDate()).padStart(2, '0')}`,
          transaction_date: generatedDateString,
          status: TransactionStatus.A_PAGAR,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
        }
        generated.push(generatedTransaction)
      }

      monthOffset++
    }
  })

  return generated.sort((a, b) => {
    const dateA = new Date(a.transaction_date)
    const dateB = new Date(b.transaction_date)
    return dateB.getTime() - dateA.getTime()
  })
}

function getRecurringDate(
  baseDate: Date,
  monthsToAdd: number,
  recurringType?: string,
  recurringDay?: number
): Date {
  const newDate = new Date(baseDate)
  newDate.setMonth(newDate.getMonth() + monthsToAdd)

  if (!recurringType || recurringType === 'none') {
    return newDate
  }

  switch (recurringType) {
    case 'day_15':
      newDate.setDate(15)
      break
    case 'last_day':
      newDate.setMonth(newDate.getMonth() + 1)
      newDate.setDate(0)
      break
    case 'custom':
      if (recurringDay) {
        const daysInMonth = new Date(
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          0
        ).getDate()
        newDate.setDate(Math.min(recurringDay, daysInMonth))
      }
      break
    case 'fifth_business_day':
      newDate.setDate(1)
      let businessDays = 0
      while (businessDays < 5) {
        const dayOfWeek = newDate.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++
        }
        if (businessDays < 5) {
          newDate.setDate(newDate.getDate() + 1)
        }
      }
      break
  }

  return newDate
}

