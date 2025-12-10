import { useMemo } from 'react'
import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { useAuth } from '@repo/core/contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBook,
  ICreateBookInput,
  IUpdateBookInput,
} from '../types/books'

export const useBooks = () => {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: books, isLoading, refetch } = useSupabaseQuery<IBook[]>(
    ['books', tenantId ?? 'no-tenant', user?.id ?? 'no-user'],
    async () => {
      if (!user) throw new Error('User not authenticated')

      const service = new BookService(supabase)
      return service.getBooks(tenantId, user.id)
    },
    {
      enabled: !!user,
    }
  )

  const createMutation = useSupabaseMutation<IBook, ICreateBookInput>(
    async (input) => {
      if (!user) throw new Error('User not authenticated')

      const service = new BookService(supabase)
      return service.createBook(tenantId, user.id, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['books'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBook, { id: string; input: IUpdateBookInput }>(
    async ({ id, input }) => {
      if (!user) throw new Error('User not authenticated')

      const service = new BookService(supabase)
      return service.updateBook(id, input)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['books'] })
        queryClient.invalidateQueries({ queryKey: ['book', variables.id] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (bookId) => {
      if (!user) throw new Error('User not authenticated')

      const service = new BookService(supabase)
      return service.deleteBook(bookId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['books'] })
      },
    }
  )

  const createBook = async (input: ICreateBookInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create book' }
    }
  }

  const updateBook = async (id: string, input: IUpdateBookInput) => {
    try {
      const result = await updateMutation.mutateAsync({ id, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update book' }
    }
  }

  const deleteBook = async (bookId: string) => {
    try {
      await deleteMutation.mutateAsync(bookId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete book' }
    }
  }

  return {
    books: books || [],
    isLoading,
    refetch,
    createBook,
    updateBook,
    deleteBook,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export const useBook = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()

  const { data: book, isLoading, refetch } = useSupabaseQuery<IBook | null>(
    ['book', bookId ?? 'no-id'],
    async () => {
      if (!bookId || !user) return null

      const service = new BookService(supabase)
      return service.getBookById(bookId)
    },
    {
      enabled: !!bookId && !!user,
    }
  )

  return {
    book,
    isLoading,
    refetch,
  }
}

