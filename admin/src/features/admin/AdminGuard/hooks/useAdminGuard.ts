import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@repo/core/hooks/useAuth'
import { UserRole } from '@repo/core/types/user'
import { isRootAdmin } from '@repo/core/lib/permissions'

export const useAdminGuard = () => {
    const router = useRouter()
    const { profile, loading } = useAuth()

    const isAdmin = profile?.role === UserRole.ADMIN || isRootAdmin(profile)

    useEffect(() => {
        if (!loading && (!profile || !isAdmin)) {
            router.push('/dashboard')
        }
    }, [profile, loading, router, isAdmin])

    return {
        isAdmin,
        loading
    }
}

