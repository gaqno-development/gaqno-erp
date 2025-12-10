import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookSettingsService } from '../services/bookSettingsService'
import {
  IBookSetting,
  ICreateBookSettingInput,
  IUpdateBookSettingInput,
} from '../types/books'

export const useBookSettings = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: settings, isLoading, refetch } = useSupabaseQuery<IBookSetting[]>(
    ['book-settings', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookSettingsService(supabase)
      return service.getSettings(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookSetting, ICreateBookSettingInput>(
    async (input) => {
      const service = new BookSettingsService(supabase)
      return service.createSetting(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-settings'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookSetting, { settingId: string; input: IUpdateBookSettingInput }>(
    async ({ settingId, input }) => {
      const service = new BookSettingsService(supabase)
      return service.updateSetting(settingId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-settings'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (settingId) => {
      const service = new BookSettingsService(supabase)
      return service.deleteSetting(settingId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-settings'] })
      },
    }
  )

  const createSetting = async (input: ICreateBookSettingInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create setting' }
    }
  }

  const updateSetting = async (settingId: string, input: IUpdateBookSettingInput) => {
    try {
      const result = await updateMutation.mutateAsync({ settingId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update setting' }
    }
  }

  const deleteSetting = async (settingId: string) => {
    try {
      await deleteMutation.mutateAsync(settingId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete setting' }
    }
  }

  return {
    settings: settings || [],
    isLoading,
    refetch,
    createSetting,
    updateSetting,
    deleteSetting,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

