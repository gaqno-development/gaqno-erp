import { useSupabaseQuery } from '@repo/core/hooks/useSupabaseQuery'
import { api } from '@repo/core/lib/api'
import { IUserProfile } from '@repo/core/types/user'

export const useUsers = () => {
  return useSupabaseQuery<IUserProfile[]>(
    ['users'],
    () => api.users.getAll()
  )
}

