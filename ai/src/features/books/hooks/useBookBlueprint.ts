import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookBlueprint,
  ICreateBookBlueprintInput,
  IUpdateBookBlueprintInput,
} from '../types/books'

export const useBookBlueprint = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: blueprint, isLoading, refetch } = useSupabaseQuery<IBookBlueprint | null>(
    ['book-blueprint', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return null

      const service = new BookService(supabase)
      return service.getBlueprint(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookBlueprint, ICreateBookBlueprintInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createBlueprint(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-blueprint'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookBlueprint, { bookId: string; input: IUpdateBookBlueprintInput }>(
    async ({ bookId, input }) => {
      const service = new BookService(supabase)
      return service.updateBlueprint(bookId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-blueprint'] })
      },
    }
  )

  const createBlueprint = async (input: ICreateBookBlueprintInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create blueprint' }
    }
  }

  const updateBlueprint = async (bookId: string, input: IUpdateBookBlueprintInput) => {
    try {
      const result = await updateMutation.mutateAsync({ bookId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update blueprint' }
    }
  }

  return {
    blueprint,
    isLoading,
    refetch,
    createBlueprint,
    updateBlueprint,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
