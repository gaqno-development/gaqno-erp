'use client'
import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { useTenantManager } from './hooks/useTenantManager'
import { DataTable } from '@repo/ui/components/ui'
import { useMemo } from 'react'
import { createTenantManagerColumns } from './columns'

export const TenantManager: React.FC = () => {
    const {
        filteredTenants,
        isLoading,
        searchTerm,
        setSearchTerm,
        selectedStatus,
        setSelectedStatus,
        statusOptions,
        openCreateDialog,
        openEditDialog,
    } = useTenantManager()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
                    <p className="text-muted-foreground">
                        Manage and configure white-label tenants
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    Add Tenant
                </Button>
            </div>

            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            className="px-3 py-2 border rounded-md w-full max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="px-3 py-2 border rounded-md"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        (() => {
                            const columns = useMemo(() => createTenantManagerColumns({ onEdit: openEditDialog }), [openEditDialog])
                            return (
                                <DataTable
                                    columns={columns}
                                    data={filteredTenants}
                                    emptyMessage="No tenants found."
                                />
                            )
                        })()
                    )}
                </div>
            </Card>
        </div>
    )
}

TenantManager.displayName = 'TenantManager'

