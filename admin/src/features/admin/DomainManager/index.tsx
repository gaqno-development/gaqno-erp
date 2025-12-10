'use client'
import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { useDomainManager } from './hooks/useDomainManager'
import { DataTable } from '@repo/ui/components/ui'
import { useMemo } from 'react'
import { createDomainColumns } from './columns'

interface IDomainManagerProps {
    tenantId: string
}

export const DomainManager: React.FC<IDomainManagerProps> = ({ tenantId }) => {
    const {
        domains,
        isLoading,
        openAddDialog,
        verifyDomain,
    } = useDomainManager(tenantId)

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const columns = useMemo(() => createDomainColumns({
        onVerify: verifyDomain,
    }), [verifyDomain])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Domain Management</h1>
                    <p className="text-muted-foreground">
                        Manage custom domains for the selected tenant
                    </p>
                </div>
                <Button onClick={openAddDialog}>
                    Add Domain
                </Button>
            </div>

            <Card className="p-6">
                <DataTable
                    columns={columns}
                    data={domains || []}
                    emptyMessage="No domains found."
                />
            </Card>
        </div>
    )
}

DomainManager.displayName = 'DomainManager'

