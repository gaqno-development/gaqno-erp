'use client'
import React from 'react'
import { RootAdminGuard } from '@repo/ui/components/guards'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RootAdminGuard>
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <span className="text-sm text-muted-foreground">Root Administrator Access</span>
                    </div>
                    <nav className="flex space-x-2 border-b pb-4 md:hidden">
                        <a href="/admin/tenants" className="px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
                            Tenants
                        </a>
                    </nav>
                </div>
                {children}
            </div>
        </RootAdminGuard>
    )
}

