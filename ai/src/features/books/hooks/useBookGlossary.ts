import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookGlossary,
  ICreateBookGlossaryInput,
  IUpdateBookGlossaryInput,
} from '../types/books'

export const useBookGlossary = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: glossary, isLoading, refetch } = useSupabaseQuery<IBookGlossary[]>(
    ['book-glossary', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookService(supabase)
      return service.getGlossary(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookGlossary, ICreateBookGlossaryInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createGlossaryTerm(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-glossary'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookGlossary, { glossaryId: string; input: IUpdateBookGlossaryInput }>(
    async ({ glossaryId, input }) => {
      const service = new BookService(supabase)
      return service.updateGlossaryTerm(glossaryId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-glossary'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (glossaryId) => {
      const service = new BookService(supabase)
      return service.deleteGlossaryTerm(glossaryId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-glossary'] })
      },
    }
  )

  const createGlossaryTerm = async (input: ICreateBookGlossaryInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create glossary term' }
    }
  }

  const updateGlossaryTerm = async (glossaryId: string, input: IUpdateBookGlossaryInput) => {
    try {
      const result = await updateMutation.mutateAsync({ glossaryId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update glossary term' }
    }
  }

  const deleteGlossaryTerm = async (glossaryId: string) => {
    try {
      await deleteMutation.mutateAsync(glossaryId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete glossary term' }
    }
  }

  return {
    glossary: glossary || [],
    isLoading,
    refetch,
    createGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

