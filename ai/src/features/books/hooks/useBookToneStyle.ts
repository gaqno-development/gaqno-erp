import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookToneStyleService } from '../services/bookToneStyleService'
import {
  IBookToneStyle,
  ICreateBookToneStyleInput,
  IUpdateBookToneStyleInput,
} from '../types/books'

export const useBookToneStyle = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: toneStyle, isLoading, refetch } = useSupabaseQuery<IBookToneStyle | null>(
    ['book-tone-style', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return null

      const service = new BookToneStyleService(supabase)
      return service.getToneStyle(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookToneStyle, ICreateBookToneStyleInput>(
    async (input) => {
      const service = new BookToneStyleService(supabase)
      return service.createToneStyle(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-tone-style'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookToneStyle, { bookId: string; input: IUpdateBookToneStyleInput }>(
    async ({ bookId, input }) => {
      const service = new BookToneStyleService(supabase)
      return service.updateToneStyle(bookId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-tone-style'] })
      },
    }
  )

  const createToneStyle = async (input: ICreateBookToneStyleInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create tone style' }
    }
  }

  const updateToneStyle = async (bookId: string, input: IUpdateBookToneStyleInput) => {
    try {
      const result = await updateMutation.mutateAsync({ bookId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update tone style' }
    }
  }

  return {
    toneStyle,
    isLoading,
    refetch,
    createToneStyle,
    updateToneStyle,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}

