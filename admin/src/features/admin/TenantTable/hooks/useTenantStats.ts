import { useMemo } from 'react'
import { useSupabaseQuery } from '@repo/core/hooks/useSupabaseQuery'
import { createClient } from '@repo/core/utils/supabase/client'
import { ITenantStats } from '../types'

export const useTenantStats = (tenantId: string) => {
    const supabase = useMemo(() => createClient(), [])

    const { data: stats, isLoading } = useSupabaseQuery<ITenantStats>(
        ['tenant-stats', tenantId],
        async () => {
            const [
                usersResult,
                featuresResult,
                brandingResult,
                domainsResult,
            ] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id', { count: 'exact' })
                    .eq('tenant_id', tenantId),
                supabase
                    .from('tenant_features')
                    .select('id, enabled', { count: 'exact' })
                    .eq('tenant_id', tenantId),
                supabase
                    .from('whitelabel_configs')
                    .select('id')
                    .eq('tenant_id', tenantId)
                    .single(),
                supabase
                    .from('domains')
                    .select('id, verified', { count: 'exact' })
                    .eq('tenant_id', tenantId),
            ])

            const enabledFeatures = featuresResult.data?.filter((f) => f.enabled).length || 0
            const verifiedDomains = domainsResult.data?.filter((d) => d.verified).length || 0

            return {
                tenant_id: tenantId,
                total_users: usersResult.count || 0,
                active_users: usersResult.count || 0,
                total_features: featuresResult.count || 0,
                enabled_features: enabledFeatures,
                has_branding: !!brandingResult.data,
                total_domains: domainsResult.count || 0,
                verified_domains: verifiedDomains,
            }
        },
        {
            enabled: !!tenantId,
        }
    )

    return {
        stats,
        isLoading,
    }
}

