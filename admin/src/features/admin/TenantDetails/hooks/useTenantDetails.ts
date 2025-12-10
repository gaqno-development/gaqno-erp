import { useState, useMemo } from 'react'
import { useSupabaseQuery } from '@repo/core/hooks/useSupabaseQuery'
import { createClient } from '@repo/core/utils/supabase/client'
import { ITenant } from '@repo/core/types/admin'
import { useRouter } from 'next/navigation'

export type TTenantTab = 'overview' | 'branding' | 'users' | 'domains' | 'features' | 'analytics'

export const useTenantDetails = (tenantId: string) => {
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TTenantTab>('overview')

    const { data: tenant, isLoading } = useSupabaseQuery<ITenant>(
        ['tenant', tenantId],
        async () => {
            const { data, error } = await supabase
                .from('tenants')
                .select(`
                    *,
                    whitelabel_configs (
                        logo_url,
                        company_name,
                        app_name,
                        primary_color,
                        secondary_color
                    )
                `)
                .eq('tenant_id', tenantId)
                .single()

            if (error) throw error
            return data
        },
        {
            enabled: !!tenantId,
        }
    )

    const handleEdit = () => {
        router.push(`/admin/tenants?edit=${tenantId}`)
    }

    return {
        tenant,
        isLoading,
        activeTab,
        setActiveTab,
        handleEdit,
    }
}

