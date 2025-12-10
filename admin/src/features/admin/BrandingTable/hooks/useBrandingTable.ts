import { useState, useMemo } from 'react'
import { useSupabaseQuery, useSupabaseMutation } from '@repo/core/hooks/useSupabaseQuery'
import { createClient } from '@repo/core/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { IBrandingConfig } from '@repo/core/types/admin'

export const useBrandingTable = () => {
    const supabase = useMemo(() => createClient(), [])
    const queryClient = useQueryClient()
    const [selectedBranding, setSelectedBranding] = useState<IBrandingConfig | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
    const [selectedTenantId, setSelectedTenantId] = useState<string>('')

    const { data: brandings, isLoading } = useSupabaseQuery<IBrandingConfig[]>(
        ['brandings'],
        async () => {
            const { data, error } = await supabase
                .from('whitelabel_configs')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        }
    )

    const deleteMutation = useSupabaseMutation<void, string>(
        async (id) => {
            const { error } = await supabase
                .from('whitelabel_configs')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['brandings'] })
            }
        }
    )

    const handleEdit = (branding: IBrandingConfig) => {
        setSelectedBranding(branding)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta configuração de branding?')) {
            await deleteMutation.mutateAsync(id)
        }
    }

    const handleCreate = () => {
        setSelectedBranding(null)
        setIsDialogOpen(true)
    }

    const handleViewUsers = (tenantId: string) => {
        setSelectedTenantId(tenantId)
        setIsUsersDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedBranding(null)
    }

    const handleCloseUsersDialog = () => {
        setIsUsersDialogOpen(false)
        setSelectedTenantId('')
    }

    return {
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
    }
}

