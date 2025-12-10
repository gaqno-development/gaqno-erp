import { useRoleBasedAccess } from '@repo/core/hooks/useRoleBasedAccess'
import { UserRole } from '@repo/core/types/user'

export const useManagerDashboard = () => {
  const { isAuthorized, loading } = useRoleBasedAccess(UserRole.MANAGER)

  return {
    isAuthorized,
    loading,
  }
}

