import { useAuth } from '@repo/core/hooks/useAuth'

export const useSettings = () => {
  const { profile, loading } = useAuth()

  return {
    profile,
    loading,
  }
}

