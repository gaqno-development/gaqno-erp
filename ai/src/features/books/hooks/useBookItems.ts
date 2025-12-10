import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookItemsService } from '../services/bookItemsService'
import {
  IBookItem,
  ICreateBookItemInput,
  IUpdateBookItemInput,
} from '../types/books'

export const useBookItems = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: items, isLoading, refetch } = useSupabaseQuery<IBookItem[]>(
    ['book-items', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookItemsService(supabase)
      return service.getItems(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookItem, ICreateBookItemInput>(
    async (input) => {
      const service = new BookItemsService(supabase)
      return service.createItem(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-items'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookItem, { itemId: string; input: IUpdateBookItemInput }>(
    async ({ itemId, input }) => {
      const service = new BookItemsService(supabase)
      return service.updateItem(itemId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-items'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (itemId) => {
      const service = new BookItemsService(supabase)
      return service.deleteItem(itemId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-items'] })
      },
    }
  )

  const createItem = async (input: ICreateBookItemInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create item' }
    }
  }

  const updateItem = async (itemId: string, input: IUpdateBookItemInput) => {
    try {
      const result = await updateMutation.mutateAsync({ itemId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update item' }
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      await deleteMutation.mutateAsync(itemId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete item' }
    }
  }

  return {
    items: items || [],
    isLoading,
    refetch,
    createItem,
    updateItem,
    deleteItem,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

