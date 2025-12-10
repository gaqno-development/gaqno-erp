import { useRoleBasedAccess } from '@repo/core/hooks/useRoleBasedAccess'
import { UserRole } from '@repo/core/types/user'

export const useAdminDashboard = () => {
  const { isAuthorized, loading } = useRoleBasedAccess(UserRole.ADMIN)

  return {
    isAuthorized,
    loading,
  }
}

