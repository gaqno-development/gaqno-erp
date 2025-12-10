import { useMemo } from 'react'
import { useSupabaseQuery } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useAuth } from '@repo/core/contexts/AuthContext'
import { FinanceService } from '../services/financeService'
import { calculateBalance } from '../utils/calcBalance'
import { IFinanceTransaction, IFinanceSummary } from '../types/finance'

export const useFinanceSummary = (startDate?: string, endDate?: string) => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { user } = useAuth()

  const { data: transactions, isLoading } = useSupabaseQuery<IFinanceTransaction[]>(
    ['finance-summary', tenantId ?? 'no-tenant', user?.id ?? 'no-user', startDate ?? '', endDate ?? ''],
    async () => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.getTransactions(tenantId, user.id, startDate, endDate)
    },
    {
      enabled: !!user,
    }
  )

  const summary = useMemo<IFinanceSummary>(() => {
    if (!transactions) {
      return {
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        invested: 0,
        availableBalance: 0,
      }
    }
    return calculateBalance(transactions)
  }, [transactions])

  return {
    summary,
    transactions,
    isLoading,
  }
}

