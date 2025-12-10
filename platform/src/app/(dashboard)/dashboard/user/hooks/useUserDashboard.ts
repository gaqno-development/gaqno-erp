import { useRoleBasedAccess } from '@repo/core/hooks/useRoleBasedAccess'
import { UserRole } from '@repo/core/types/user'

export const useUserDashboard = () => {
  const { isAuthorized, loading } = useRoleBasedAccess(UserRole.USER)

  return {
    isAuthorized,
    loading,
  }
}

