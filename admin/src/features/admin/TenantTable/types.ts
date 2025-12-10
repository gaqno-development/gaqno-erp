import { ITenant } from '@repo/core/types/admin'

export interface ITenantTableProps {
    view?: 'grid' | 'table'
}

export interface ITenantCardProps {
    tenant: ITenant
    onEdit: (tenant: ITenant) => void
    onDelete: (id: string) => void
    onViewUsers: (tenant: ITenant) => void
    onViewStats: (tenant: ITenant) => void
}

export interface ITenantDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenantData?: ITenant | null
}

export interface ITenantStats {
    tenant_id: string
    total_users: number
    active_users: number
    total_features: number
    enabled_features: number
    has_branding: boolean
    total_domains: number
    verified_domains: number
}

export interface ITenantStatsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenant: ITenant
}

