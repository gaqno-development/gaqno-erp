'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import {
    Plus,
    Grid3x3,
    Table as TableIcon,
    Search,
    Pencil,
    ExternalLink,
    Users,
    Palette,
    Globe,
    Rocket,
    BarChart3
} from 'lucide-react'
import { useTenantTable } from './hooks/useTenantTable'
import { TenantCard } from './components/TenantCard'
import { TenantDialog } from './components/TenantDialog'
import { TenantStatsDialog } from './components/TenantStatsDialog'
import { TenantUsersDialog } from '../BrandingTable/components/TenantUsersDialog'
import { formatDate } from '@repo/core/utils/date'
import { DataTable } from '@repo/ui/components/ui'
import { useMemo } from 'react'
import { createTenantTableColumns } from './columns'

export const TenantTable: React.FC = () => {
    const {
        tenants,
        isLoading,
        searchTerm,
        setSearchTerm,
        selectedStatus,
        setSelectedStatus,
        statusOptions,
        stats,
        selectedTenant,
        isDialogOpen,
        isUsersDialogOpen,
        isStatsDialogOpen,
        viewMode,
        setViewMode,
        handleEdit,
        handleDelete,
        handleCreate,
        handleViewUsers,
        handleViewStats,
        handleCloseDialog,
        handleCloseUsersDialog,
        handleCloseStatsDialog,
    } = useTenantTable()

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Gerenciamento de Tenants
                    </h1>
                    <p className="text-muted-foreground">
                        Configure e gerencie instâncias white-label
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tenant
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xl font-bold">
                                {stats.total}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Ativos</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-xl font-bold">
                                {stats.active}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Trial</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xl font-bold">
                                {stats.trial}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Inativos</p>
                            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 text-xl font-bold">
                                {stats.inactive}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome, domínio ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

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

                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {tenants && tenants.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tenants.map((tenant) => (
                                <TenantCard
                                    key={tenant.id}
                                    tenant={tenant}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewUsers={handleViewUsers}
                                    onViewStats={handleViewStats}
                                />
                            ))}
                        </div>
                    ) : (
                        (() => {
                            const columns = useMemo(() => createTenantTableColumns({
                                onEdit: handleEdit,
                                onViewUsers: handleViewUsers,
                            }), [handleEdit, handleViewUsers])
                            return (
                                <DataTable
                                    columns={columns}
                                    data={tenants}
                                    emptyMessage="Nenhum tenant encontrado"
                                />
                            )
                        })()
                    )
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum tenant encontrado</p>
                    </div>
                )}
            </Card>

            <TenantDialog
                open={isDialogOpen}
                onOpenChange={handleCloseDialog}
                tenantData={selectedTenant}
            />

            {selectedTenant && (
                <>
                    <TenantUsersDialog
                        open={isUsersDialogOpen}
                        onOpenChange={handleCloseUsersDialog}
                        tenantId={selectedTenant.tenant_id}
                        tenantName={selectedTenant.name}
                    />
                    <TenantStatsDialog
                        open={isStatsDialogOpen}
                        onOpenChange={handleCloseStatsDialog}
                        tenant={selectedTenant}
                    />
                </>
            )}
        </div>
    )
}

TenantTable.displayName = 'TenantTable'

