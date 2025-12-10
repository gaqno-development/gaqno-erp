import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useQueryClient } from '@tanstack/react-query'
import { FinanceService } from '../services/financeService'
import {
  IFinanceCategory,
  ICreateCategoryInput,
  IUpdateCategoryInput,
  TransactionType,
} from '../types/finance'

export const useCategories = (type?: TransactionType) => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const queryClient = useQueryClient()

  const { data: categories, isLoading, refetch } = useSupabaseQuery<IFinanceCategory[]>(
    ['finance-categories', tenantId ?? 'no-tenant', type ?? 'all'],
    async () => {
      const service = new FinanceService(supabase)
      return service.getCategories(tenantId, type)
    }
  )

  const createMutation = useSupabaseMutation<IFinanceCategory, ICreateCategoryInput>(
    async (input) => {
      const service = new FinanceService(supabase)
      return service.createCategory(tenantId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-categories', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IFinanceCategory, IUpdateCategoryInput>(
    async (input) => {
      const service = new FinanceService(supabase)
      return service.updateCategory(tenantId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-categories', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (categoryId) => {
      const service = new FinanceService(supabase)
      return service.deleteCategory(tenantId, categoryId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-categories', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const createCategory = async (input: ICreateCategoryInput) => {
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

  const updateCategory = async (input: IUpdateCategoryInput) => {
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

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteMutation.mutateAsync(categoryId)
      return { success: true, error: null }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  return {
    categories: categories || [],
    isLoading,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

