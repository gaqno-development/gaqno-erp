import { ITenantUser } from '@/features/admin/BrandingTable/types'

export interface IUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userData?: ITenantUser | null
    tenantId: string
    tenantName: string
}

