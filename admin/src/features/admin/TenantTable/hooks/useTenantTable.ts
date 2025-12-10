import { useState, useMemo, useEffect } from 'react'
import { useTenants } from '@repo/core/hooks/admin/useTenants'
import { ITenant } from '@repo/core/types/admin'

export const useTenantTable = () => {
    const { tenants, isLoading, deleteTenant } = useTenants()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedTenant, setSelectedTenant] = useState<ITenant | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
    const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

    const filteredTenants = useMemo(() => {
        let filtered = tenants || []

        if (searchTerm) {
            filtered = filtered.filter(
                (tenant) =>
                    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter((tenant) => tenant.status === selectedStatus)
        }

        return filtered
    }, [tenants, searchTerm, selectedStatus])

    const statusOptions = [
        { value: 'all', label: 'Todos os Status' },
        { value: 'active', label: 'Ativos' },
        { value: 'inactive', label: 'Inativos' },
        { value: 'trial', label: 'Trial' },
    ]

    const stats = useMemo(() => {
        const total = tenants?.length || 0
        const active = tenants?.filter((t) => t.status === 'active').length || 0
        const trial = tenants?.filter((t) => t.status === 'trial').length || 0
        const inactive = tenants?.filter((t) => t.status === 'inactive').length || 0

        return { total, active, trial, inactive }
    }, [tenants])

    const handleEdit = (tenant: ITenant) => {
        setSelectedTenant(tenant)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este tenant? Esta ação não pode ser desfeita.')) {
            await deleteTenant(id)
        }
    }

    const handleCreate = () => {
        setSelectedTenant(null)
        setIsDialogOpen(true)
    }

    const handleViewUsers = (tenant: ITenant) => {
        setSelectedTenant(tenant)
        setIsUsersDialogOpen(true)
    }

    const handleViewStats = (tenant: ITenant) => {
        setSelectedTenant(tenant)
        setIsStatsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedTenant(null)
    }

    const handleCloseUsersDialog = () => {
        setIsUsersDialogOpen(false)
    }

    const handleCloseStatsDialog = () => {
        setIsStatsDialogOpen(false)
    }

    return {
        tenants: filteredTenants,
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
    }
}

