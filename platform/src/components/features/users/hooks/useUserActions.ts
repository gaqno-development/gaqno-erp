import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@repo/core/lib/api'
import { IUpdateUserRequest } from '@repo/core/types/user'

export const useUserActions = () => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateUserRequest }) =>
      api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

