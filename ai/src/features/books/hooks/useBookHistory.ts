import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookHistory,
  ICreateBookHistoryInput,
} from '../types/books'

export const useBookHistory = (chapterId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: history, isLoading, refetch } = useSupabaseQuery<IBookHistory[]>(
    ['book-history', chapterId ?? 'no-id'],
    async () => {
      if (!chapterId) return []

      const service = new BookService(supabase)
      return service.getHistory(chapterId)
    },
    {
      enabled: !!chapterId,
    }
  )

  const createMutation = useSupabaseMutation<IBookHistory, ICreateBookHistoryInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createHistory(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-history'] })
      },
    }
  )

  const createHistory = async (input: ICreateBookHistoryInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create history' }
    }
  }

  return {
    history: history || [],
    isLoading,
    refetch,
    createHistory,
    isCreating: createMutation.isPending,
  }
}
