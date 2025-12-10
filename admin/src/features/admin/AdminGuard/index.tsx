'use client'
import React from 'react'
import { useAdminGuard } from './hooks/useAdminGuard'

interface IAdminGuardProps {
    children: React.ReactNode
}

export const AdminGuard: React.FC<IAdminGuardProps> = ({ children }) => {
    const { isAdmin, loading } = useAdminGuard()

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                <p className="text-muted-foreground">
                    You don&apos;t have permission to access this area.
                </p>
            </div>
        )
    }

    return <>{children}</>
}

AdminGuard.displayName = 'AdminGuard'

