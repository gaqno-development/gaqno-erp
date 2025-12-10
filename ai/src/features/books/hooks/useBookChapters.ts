import { useEffect, useRef } from 'react'
import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookChapter,
  ICreateBookChapterInput,
  IUpdateBookChapterInput,
} from '../types/books'

export const useBookChapters = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const { data: chapters, isLoading, refetch } = useSupabaseQuery<IBookChapter[]>(
    ['book-chapters', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookService(supabase)
      return service.getChapters(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookChapter, ICreateBookChapterInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createChapter(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-chapters'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookChapter, { chapterId: string; input: IUpdateBookChapterInput }>(
    async ({ chapterId, input }) => {
      const service = new BookService(supabase)
      return service.updateChapter(chapterId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-chapters'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (chapterId) => {
      const service = new BookService(supabase)
      return service.deleteChapter(chapterId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-chapters'] })
      },
    }
  )

  const createChapter = async (input: ICreateBookChapterInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create chapter' }
    }
  }

  const updateChapter = async (chapterId: string, input: IUpdateBookChapterInput) => {
    try {
      const result = await updateMutation.mutateAsync({ chapterId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update chapter' }
    }
  }

  const updateChapterAutoSave = (chapterId: string, input: IUpdateBookChapterInput) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      updateChapter(chapterId, input)
    }, 3000)
  }

  const deleteChapter = async (chapterId: string) => {
    try {
      await deleteMutation.mutateAsync(chapterId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete chapter' }
    }
  }

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    chapters: chapters || [],
    isLoading,
    refetch,
    createChapter,
    updateChapter,
    updateChapterAutoSave,
    deleteChapter,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export const useBookChapter = (chapterId: string | null) => {
  const supabase = useSupabaseClient()

  const { data: chapter, isLoading, refetch } = useSupabaseQuery<IBookChapter | null>(
    ['book-chapter', chapterId ?? 'no-id'],
    async () => {
      if (!chapterId) return null

      const service = new BookService(supabase)
      return service.getChapterById(chapterId)
    },
    {
      enabled: !!chapterId,
    }
  )

  return {
    chapter,
    isLoading,
    refetch,
  }
}
