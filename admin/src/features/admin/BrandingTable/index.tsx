'use client'

import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Plus } from 'lucide-react'
import { useBrandingTable } from './hooks/useBrandingTable'
import { BrandingDialog } from './components/BrandingDialog'
import { TenantUsersDialog } from './components/TenantUsersDialog'
import { DataTable } from '@repo/ui/components/ui'
import { createBrandingColumns } from './columns'
import { useMemo } from 'react'

export const BrandingTable: React.FC = () => {
    const {
        brandings,
        isLoading,
        selectedBranding,
        isDialogOpen,
        isUsersDialogOpen,
        selectedTenantId,
        handleEdit,
        handleDelete,
        handleCreate,
        handleViewUsers,
        handleCloseDialog,
        handleCloseUsersDialog,
    } = useBrandingTable()

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const columns = useMemo(() => createBrandingColumns({
        onViewUsers: handleViewUsers,
        onEdit: handleEdit,
        onDelete: handleDelete,
    }), [handleViewUsers, handleEdit, handleDelete])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Branding</h1>
                    <p className="text-muted-foreground">
                        Configure logos, cores e identidade visual das empresas
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Configuração
                </Button>
            </div>

            <Card className="p-6">
                <DataTable
                    columns={columns}
                    data={brandings || []}
                    emptyMessage="Nenhuma configuração de branding encontrada"
                />
            </Card>

            <BrandingDialog
                open={isDialogOpen}
                onOpenChange={handleCloseDialog}
                brandingData={selectedBranding}
            />

            {selectedTenantId && (
                <TenantUsersDialog
                    open={isUsersDialogOpen}
                    onOpenChange={handleCloseUsersDialog}
                    tenantId={selectedTenantId}
                    tenantName={brandings?.find(b => b.tenant_id === selectedTenantId)?.company_name || ''}
                />
            )}
        </div>
    )
}

BrandingTable.displayName = 'BrandingTable'

