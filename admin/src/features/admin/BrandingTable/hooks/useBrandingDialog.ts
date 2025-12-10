import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { brandingSchema, IBrandingFormValues } from '../schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@repo/core/utils/supabase/client'
import { useMemo } from 'react'
import { IBrandingConfig } from '@repo/core/types/admin'

export const useBrandingDialog = (
    brandingData: IBrandingConfig | null | undefined,
    onSuccess: () => void
) => {
    const supabase = useMemo(() => createClient(), [])
    const queryClient = useQueryClient()

    const form = useForm<IBrandingFormValues>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            tenant_id: brandingData?.tenant_id || '',
            company_name: brandingData?.company_name || '',
            app_name: brandingData?.app_name || '',
            logo_url: brandingData?.logo_url || '',
            favicon_url: brandingData?.favicon_url || '',
            primary_color: brandingData?.primary_color || '#3B82F6',
            secondary_color: brandingData?.secondary_color || '#8B5CF6',
            font_family: brandingData?.font_family || 'Inter, sans-serif',
            custom_css: brandingData?.custom_css || '',
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: IBrandingFormValues) => {
            if (brandingData?.id) {
                const { data: updated, error } = await supabase
                    .from('whitelabel_configs')
                    .update(data)
                    .eq('id', brandingData.id)
                    .select()
                    .single()

                if (error) throw error
                return updated
            } else {
                const { data: created, error } = await supabase
                    .from('whitelabel_configs')
                    .insert(data)
                    .select()
                    .single()

                if (error) throw error
                return created
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brandings'] })
            form.reset()
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

