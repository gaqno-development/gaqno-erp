import { useState } from 'react'
import { useDomains } from '@repo/core/hooks/admin/useDomains'
import { useDialog } from '@repo/core/hooks/useDialog'
import { IDomain } from '@repo/core/types/admin'

export const useDomainManager = (tenantId: string) => {
    const { domains, isLoading, createDomain, updateDomain, deleteDomain, verifyDomain } = useDomains(tenantId)

    const addDialog = useDialog()
    const editDialog = useDialog<IDomain>()

    const openAddDialog = () => {
        addDialog.open()
    }

    const openEditDialog = (domain: IDomain) => {
        editDialog.open(domain)
    }

    const handleVerifyDomain = async (domainId: string) => {
        await verifyDomain(domainId)
    }

    const handleDeleteDomain = async (domainId: string) => {
        await deleteDomain(domainId)
    }

    return {
        domains,
        isLoading,
        addDialog,
        editDialog,
        openAddDialog,
        openEditDialog,
        verifyDomain: handleVerifyDomain,
        deleteDomain: handleDeleteDomain
    }
}

