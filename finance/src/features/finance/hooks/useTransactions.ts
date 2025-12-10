import { useMemo } from 'react'
import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useAuth } from '@repo/core/contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { FinanceService } from '../services/financeService'
import {
  IFinanceTransaction,
  ICreateTransactionInput,
  IUpdateTransactionInput,
  TransactionStatus,
} from '../types/finance'

export const useTransactions = (startDate?: string, endDate?: string) => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: transactions, isLoading, refetch } = useSupabaseQuery<IFinanceTransaction[]>(
    ['finance-transactions', tenantId ?? 'no-tenant', user?.id ?? 'no-user', startDate ?? '', endDate ?? ''],
    async () => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.getTransactions(tenantId, user.id, startDate, endDate)
    },
    {
      enabled: !!user,
    }
  )

  const createMutation = useSupabaseMutation<IFinanceTransaction, ICreateTransactionInput>(
    async (input) => {
      if (!user) throw new Error('User not authenticated')

      const insertData = {
        tenant_id: tenantId || '',
        user_id: user.id,
        description: input.description,
        amount: input.amount,
        type: input.type,
        transaction_date: input.transaction_date,
        due_date: input.due_date || null,
        credit_card_id: input.credit_card_id || null,
        status: input.status || TransactionStatus.A_PAGAR,
        notes: input.notes || null,
        installment_count: input.installment_count || 1,
        installment_current: input.installment_current || 1,
        is_recurring: input.is_recurring || false,
        recurring_type: input.recurring_type || null,
        recurring_day: input.recurring_day || null,
        recurring_months: input.recurring_months || null,
        icon: input.icon || null,
      }

      const { data, error } = await (supabase
        .from('finance_transactions') as any)
        .insert(insertData)
        .select('*')
        .single()

      if (error) {
        console.error('Direct insert error:', error)
        throw error
      }

      if (!data) {
        throw new Error('Insert succeeded but no data returned')
      }

      const { data: fullData, error: relationError } = await supabase
        .from('finance_transactions')
        .select(`
          *,
          category:finance_categories(*),
          creditCard:finance_credit_cards(*)
        `)
        .eq('id', data.id)
        .single()

      if (relationError) {
        console.warn('Failed to fetch relations, returning basic data:', relationError)
        return data as IFinanceTransaction
      }

      return fullData as IFinanceTransaction
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ 
          queryKey: ['finance-transactions'],
          exact: false 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['finance-summary'],
          exact: false 
        })
      },
      onError: (error) => {
        console.error('createMutation error:', error)
      },
    }
  )

  const updateMutation = useSupabaseMutation<IFinanceTransaction, IUpdateTransactionInput>(
    async (input) => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.updateTransaction(tenantId, user.id, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ 
          queryKey: ['finance-transactions'],
          exact: false 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['finance-summary'],
          exact: false 
        })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (transactionId) => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.deleteTransaction(tenantId, user.id, transactionId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ 
          queryKey: ['finance-transactions'],
          exact: false 
        })
        queryClient.invalidateQueries({ 
          queryKey: ['finance-summary'],
          exact: false 
        })
      },
      onError: (error) => {
        console.error('Delete mutation error:', error)
      },
    }
  )

  const createTransaction = async (input: ICreateTransactionInput) => {
      const result = await createMutation.mutateAsync(input)
      if (!result) {
        return { success: false, error: 'Failed to create transaction' }
      }
      return { success: true, error: null }
  }

  const updateTransaction = async (input: IUpdateTransactionInput) => {
    const result = await updateMutation.mutateAsync(input)
    if (!result) {
      return { success: false, error: 'Failed to update transaction' }
    }
    return { success: true, error: null }
  }

  const deleteTransaction = async (transactionId: string) => {
    const result = await deleteMutation.mutateAsync(transactionId)
    if (result === undefined) {
      return { success: false, error: 'Failed to delete transaction' }
    }
    return { success: true, error: null }
  }

  return {
    transactions: transactions || [],
    isLoading,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

