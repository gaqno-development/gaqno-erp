import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useAuth } from '@repo/core/contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { FinanceService } from '../services/financeService'
import {
  ICreditCard,
  ICreateCreditCardInput,
  IUpdateCreditCardInput,
  ICreditCardSummary,
} from '../types/finance'

export const useCreditCards = () => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: creditCards, isLoading, refetch } = useSupabaseQuery<ICreditCard[]>(
    ['finance-credit-cards', tenantId ?? 'no-tenant', user?.id ?? 'no-user'],
    async () => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.getCreditCards(tenantId, user.id)
    },
    {
      enabled: !!user,
    }
  )

  const createMutation = useSupabaseMutation<ICreditCard, ICreateCreditCardInput>(
    async (input) => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.createCreditCard(tenantId, user.id, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-credit-cards', tenantId ?? 'no-tenant'] })
        queryClient.invalidateQueries({ queryKey: ['finance-summary', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<ICreditCard, IUpdateCreditCardInput>(
    async (input) => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.updateCreditCard(tenantId, user.id, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-credit-cards', tenantId ?? 'no-tenant'] })
        queryClient.invalidateQueries({ queryKey: ['finance-summary', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (creditCardId) => {
      if (!user) throw new Error('User not authenticated')

      const service = new FinanceService(supabase)
      return service.deleteCreditCard(tenantId, user.id, creditCardId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-credit-cards', tenantId ?? 'no-tenant'] })
        queryClient.invalidateQueries({ queryKey: ['finance-transactions', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const createCreditCard = async (input: ICreateCreditCardInput) => {
    try {
      await createMutation.mutateAsync(input)
      return { success: true, error: null }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  const updateCreditCard = async (input: IUpdateCreditCardInput) => {
    try {
      await updateMutation.mutateAsync(input)
      return { success: true, error: null }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  const deleteCreditCard = async (creditCardId: string) => {
    try {
      await deleteMutation.mutateAsync(creditCardId)
      return { success: true, error: null }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  return {
    creditCards: creditCards || [],
    isLoading,
    refetch,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export const useCreditCardSummary = (
  creditCardId: string | null,
  startDate?: string,
  endDate?: string
) => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { user } = useAuth()

  return useSupabaseQuery<ICreditCardSummary>(
    ['finance-credit-card-summary', tenantId ?? 'no-tenant', creditCardId ?? '', startDate ?? '', endDate ?? ''],
    async () => {
      if (!user || !creditCardId) throw new Error('User or credit card not available')

      const service = new FinanceService(supabase)
      return service.getCreditCardSummary(tenantId, user.id, creditCardId, startDate, endDate)
    },
    {
      enabled: !!user && !!creditCardId,
    }
  )
}

