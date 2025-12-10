import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookCover,
  ICreateBookCoverInput,
  IUpdateBookCoverInput,
} from '../types/books'

export const useBookCovers = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: covers, isLoading, refetch } = useSupabaseQuery<IBookCover[]>(
    ['book-covers', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookService(supabase)
      return service.getCovers(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookCover, ICreateBookCoverInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createCover(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-covers'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookCover, { coverId: string; input: IUpdateBookCoverInput }>(
    async ({ coverId, input }) => {
      const service = new BookService(supabase)
      return service.updateCover(coverId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-covers'] })
      },
    }
  )

  const createCover = async (input: ICreateBookCoverInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create cover' }
    }
  }

  const updateCover = async (coverId: string, input: IUpdateBookCoverInput) => {
    try {
      const result = await updateMutation.mutateAsync({ coverId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update cover' }
    }
  }

  return {
    covers: covers || [],
    isLoading,
    refetch,
    createCover,
    updateCover,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}

export const useBookActiveCover = (bookId: string | null) => {
  const supabase = useSupabaseClient()

  const { data: cover, isLoading, refetch } = useSupabaseQuery<IBookCover | null>(
    ['book-active-cover', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return null

      const service = new BookService(supabase)
      return service.getActiveCover(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  return {
    cover,
    isLoading,
    refetch,
  }
}
