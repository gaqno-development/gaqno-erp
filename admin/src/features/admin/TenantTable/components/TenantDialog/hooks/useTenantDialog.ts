import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tenantSchema, ITenantFormValues } from '../../../schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@repo/core/utils/supabase/client'
import { useMemo, useEffect } from 'react'
import { ITenant } from '@repo/core/types/admin'

export const useTenantDialog = (
    tenantData: ITenant | null | undefined,
    onSuccess: () => void
) => {
    const supabase = useMemo(() => createClient(), [])
    const queryClient = useQueryClient()

    const form = useForm<ITenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            tenant_id: '',
            name: '',
            domain: '',
            status: 'trial',
            max_users: 10,
        },
    })

    useEffect(() => {
        if (tenantData) {
            form.reset({
                tenant_id: tenantData.tenant_id,
                name: tenantData.name,
                domain: tenantData.domain,
                status: tenantData.status,
                max_users: tenantData.max_users,
            })
        } else {
            form.reset({
                tenant_id: '',
                name: '',
                domain: '',
                status: 'trial',
                max_users: 10,
            })
        }
    }, [tenantData, form])

    const mutation = useMutation({
        mutationFn: async (data: ITenantFormValues) => {
            if (tenantData?.id) {
                const { data: updated, error } = await supabase
                    .from('tenants')
                    .update(data)
                    .eq('id', tenantData.id)
                    .select()
                    .single()

                if (error) throw error
                return updated
            } else {
                const { data: created, error } = await supabase
                    .from('tenants')
                    .insert({ ...data, user_count: 0 })
                    .select()
                    .single()

                if (error) throw error
                return created
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            onSuccess()
        },
    })

    const onSubmit = form.handleSubmit((data) => {
        mutation.mutate(data)
    })

    return {
        form,
        onSubmit,
        isSubmitting: mutation.isPending,
    }
}

