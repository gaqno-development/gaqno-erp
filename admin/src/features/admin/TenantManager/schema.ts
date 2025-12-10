import { z } from 'zod'

export const tenantSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    tenant_id: z.string().min(3, 'Tenant ID must be at least 3 characters'),
    domain: z.string().min(3, 'Domain must be at least 3 characters'),
    status: z.enum(['active', 'inactive', 'trial']),
    max_users: z.coerce.number().min(1, 'Must allow at least 1 user'),
})

export type ITenantFormValues = z.infer<typeof tenantSchema>

