import { useState } from 'react'
import { useTenantUsers } from '@/features/admin/BrandingTable/hooks/useTenantUsers'
import { ITenantUser } from '@/features/admin/BrandingTable/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@repo/core/utils/supabase/client'
import { useMemo } from 'react'

export const useUsersTab = (tenantId: string) => {
    const supabase = useMemo(() => createClient(), [])
    const queryClient = useQueryClient()
    const { users, isLoading } = useTenantUsers(tenantId)
    const [selectedUser, setSelectedUser] = useState<ITenantUser | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { data: profile, error: getError } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('id', userId)
                .single()

            if (getError) throw getError

            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (profileError) throw profileError

            if (profile?.user_id) {
                const { error: authError } = await supabase.auth.admin.deleteUser(
                    profile.user_id
                )
                if (authError) console.error('Erro ao deletar usuário do auth:', authError)
            }

            const { error: tenantError } = await supabase.rpc('decrement_tenant_user_count', {
                p_tenant_id: tenantId,
            })

            if (tenantError) console.error('Erro ao decrementar contador:', tenantError)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenant-stats', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
        },
    })

    const handleCreate = () => {
        setSelectedUser(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (user: ITenantUser) => {
        setSelectedUser(user)
        setIsDialogOpen(true)
    }

    const handleDelete = async (userId: string, userName: string) => {
        if (
            confirm(
                `Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`
            )
        ) {
            await deleteMutation.mutateAsync(userId)
        }
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedUser(null)
    }

    return {
        users,
        isLoading,
        selectedUser,
        isDialogOpen,
        handleCreate,
        handleEdit,
        handleDelete,
        handleCloseDialog,
    }
}

