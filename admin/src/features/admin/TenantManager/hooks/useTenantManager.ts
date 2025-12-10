import { useState, useEffect } from 'react'
import { useTenants } from '@repo/core/hooks/admin/useTenants'
import { ITenant } from '@repo/core/types/admin'
import { useDialog } from '@repo/core/hooks/useDialog'

export const useTenantManager = () => {
    const { tenants, isLoading, createTenant, updateTenant, deleteTenant } = useTenants()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [filteredTenants, setFilteredTenants] = useState<ITenant[]>([])

    const createDialog = useDialog()
    const editDialog = useDialog<ITenant>()
    const usersDialog = useDialog<ITenant>()
    const deleteDialog = useDialog<ITenant>()

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'trial', label: 'Trial' }
    ]

    useEffect(() => {
        let filtered = tenants || []

        if (searchTerm) {
            filtered = filtered.filter(tenant =>
                tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(tenant => tenant.status === selectedStatus)
        }

        setFilteredTenants(filtered)
    }, [tenants, searchTerm, selectedStatus])

    const openCreateDialog = () => {
        createDialog.open()
    }

    const openEditDialog = (tenant: ITenant) => {
        editDialog.open(tenant)
    }

    const openUsersDialog = (tenant: ITenant) => {
        usersDialog.open(tenant)
    }

    const openDeleteDialog = (tenant: ITenant) => {
        deleteDialog.open(tenant)
    }

    const handleCreateTenant = async (data: Partial<ITenant>) => {
        const result = await createTenant(data)
        if (result.success) {
            createDialog.close()
        }
        return result
    }

    const handleUpdateTenant = async (id: string, data: Partial<ITenant>) => {
        const result = await updateTenant(id, data)
        if (result.success) {
            editDialog.close()
        }
        return result
    }

    const handleDeleteTenant = async (id: string) => {
        const result = await deleteTenant(id)
        if (result.success) {
            deleteDialog.close()
        }
        return result
    }

    return {
        tenants,
        isLoading,
        filteredTenants,
        searchTerm,
        setSearchTerm,
        selectedStatus,
        setSelectedStatus,
        statusOptions,
        createDialog,
        editDialog,
        usersDialog,
        deleteDialog,
        openCreateDialog,
        openEditDialog,
        openUsersDialog,
        openDeleteDialog,
        handleCreateTenant,
        handleUpdateTenant,
        handleDeleteTenant
    }
}

