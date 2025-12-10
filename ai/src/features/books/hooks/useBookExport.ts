import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookExport,
  ICreateBookExportInput,
  IUpdateBookExportInput,
} from '../types/books'

export const useBookExports = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: exports, isLoading, refetch } = useSupabaseQuery<IBookExport[]>(
    ['book-exports', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookService(supabase)
      return service.getExports(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookExport, ICreateBookExportInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createExport(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-exports'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookExport, { exportId: string; input: IUpdateBookExportInput }>(
    async ({ exportId, input }) => {
      const service = new BookService(supabase)
      return service.updateExport(exportId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-exports'] })
      },
    }
  )

  const createExport = async (input: ICreateBookExportInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create export' }
    }
  }

  const updateExport = async (exportId: string, input: IUpdateBookExportInput) => {
    try {
      const result = await updateMutation.mutateAsync({ exportId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update export' }
    }
  }

  return {
    exports: exports || [],
    isLoading,
    refetch,
    createExport,
    updateExport,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
