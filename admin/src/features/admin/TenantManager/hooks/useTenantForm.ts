import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tenantSchema, ITenantFormValues } from '../schema'
import { ITenant } from '@repo/core/types/admin'

export const useTenantForm = (
    tenant: ITenant | undefined,
    onSubmit: (data: ITenantFormValues) => Promise<any>
) => {
    const form = useForm<ITenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: tenant ? {
            name: tenant.name,
            tenant_id: tenant.tenant_id,
            domain: tenant.domain,
            status: tenant.status,
            max_users: tenant.max_users,
        } : {
            name: '',
            tenant_id: '',
            domain: '',
            status: 'trial',
            max_users: 10,
        }
    })

    const handleSubmit = form.handleSubmit(async (data) => {
        await onSubmit(data)
    })

    return {
        form,
        handleSubmit,
        isSubmitting: form.formState.isSubmitting
    }
}

