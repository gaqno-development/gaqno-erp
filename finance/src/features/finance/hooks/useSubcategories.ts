import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useQueryClient } from '@tanstack/react-query'
import { FinanceService } from '../services/financeService'
import {
  IFinanceSubcategory,
  ICreateSubcategoryInput,
  IUpdateSubcategoryInput,
} from '../types/finance'

export const useSubcategories = (parentCategoryId: string | null) => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const queryClient = useQueryClient()

  const { data: subcategories, isLoading, refetch } = useSupabaseQuery<IFinanceSubcategory[]>(
    ['finance-subcategories', tenantId ?? 'no-tenant', parentCategoryId ?? 'no-parent'],
    async () => {
      if (!parentCategoryId) return []
      const service = new FinanceService(supabase)
      return service.getSubcategories(tenantId, parentCategoryId)
    },
    {
      enabled: !!parentCategoryId,
    }
  )

  const createMutation = useSupabaseMutation<IFinanceSubcategory, ICreateSubcategoryInput>(
    async (input) => {
      const service = new FinanceService(supabase)
      return service.createSubcategory(tenantId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-subcategories', tenantId ?? 'no-tenant'] })
        queryClient.invalidateQueries({ queryKey: ['finance-categories', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IFinanceSubcategory, IUpdateSubcategoryInput>(
    async (input) => {
      const service = new FinanceService(supabase)
      return service.updateSubcategory(tenantId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-subcategories', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (subcategoryId) => {
      const service = new FinanceService(supabase)
      return service.deleteSubcategory(tenantId, subcategoryId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-subcategories', tenantId ?? 'no-tenant'] })
      },
    }
  )

  const createSubcategory = async (input: ICreateSubcategoryInput) => {
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

  const updateSubcategory = async (input: IUpdateSubcategoryInput) => {
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

  const deleteSubcategory = async (subcategoryId: string) => {
    try {
      await deleteMutation.mutateAsync(subcategoryId)
      return { success: true, error: null }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  return {
    subcategories: subcategories || [],
    isLoading,
    refetch,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

