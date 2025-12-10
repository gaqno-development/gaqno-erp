import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { BookService } from '../services/bookService'
import {
  IBookCharacter,
  ICreateBookCharacterInput,
  IUpdateBookCharacterInput,
} from '../types/books'

export const useBookCharacters = (bookId: string | null) => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: characters, isLoading, refetch } = useSupabaseQuery<IBookCharacter[]>(
    ['book-characters', bookId ?? 'no-id'],
    async () => {
      if (!bookId) return []

      const service = new BookService(supabase)
      return service.getCharacters(bookId)
    },
    {
      enabled: !!bookId,
    }
  )

  const createMutation = useSupabaseMutation<IBookCharacter, ICreateBookCharacterInput>(
    async (input) => {
      const service = new BookService(supabase)
      return service.createCharacter(input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-characters'] })
      },
    }
  )

  const updateMutation = useSupabaseMutation<IBookCharacter, { characterId: string; input: IUpdateBookCharacterInput }>(
    async ({ characterId, input }) => {
      const service = new BookService(supabase)
      return service.updateCharacter(characterId, input)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-characters'] })
      },
    }
  )

  const deleteMutation = useSupabaseMutation<void, string>(
    async (characterId) => {
      const service = new BookService(supabase)
      return service.deleteCharacter(characterId)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['book-characters'] })
      },
    }
  )

  const createCharacter = async (input: ICreateBookCharacterInput) => {
    try {
      const result = await createMutation.mutateAsync(input)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create character' }
    }
  }

  const updateCharacter = async (characterId: string, input: IUpdateBookCharacterInput) => {
    try {
      const result = await updateMutation.mutateAsync({ characterId, input })
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update character' }
    }
  }

  const deleteCharacter = async (characterId: string) => {
    try {
      await deleteMutation.mutateAsync(characterId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete character' }
    }
  }

  return {
    characters: characters || [],
    isLoading,
    refetch,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

