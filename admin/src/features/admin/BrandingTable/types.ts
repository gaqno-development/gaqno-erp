import { IBrandingConfig } from '@repo/core/types/admin'

export interface IBrandingTableProps {
    onEdit?: (branding: IBrandingConfig) => void
    onDelete?: (id: string) => void
    onViewUsers?: (tenantId: string) => void
}

export interface IBrandingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    brandingData?: IBrandingConfig | null
    tenantId?: string
}

export interface ITenantUser {
    id: string
    user_id: string
    name: string
    email: string
    role: string
    avatar_url: string | null
    created_at: string
}

export interface ITenantUsersDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenantId: string
    tenantName: string
}

