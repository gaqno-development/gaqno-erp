import { useMemo } from 'react'
import { useSupabaseQuery } from '@repo/core/hooks/useSupabaseQuery'
import { createClient } from '@repo/core/utils/supabase/client'
import { ITenantUser } from '../types'

export const useTenantUsers = (tenantId: string) => {
    const supabase = useMemo(() => createClient(), [])

    const { data: users, isLoading } = useSupabaseQuery<ITenantUser[]>(
        ['tenant-users', tenantId],
        async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        },
        {
            enabled: !!tenantId,
        }
    )

    return {
        users,
        isLoading,
    }
}

