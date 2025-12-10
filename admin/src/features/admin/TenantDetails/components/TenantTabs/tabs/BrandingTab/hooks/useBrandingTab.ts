import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { brandingSchema, IBrandingFormValues } from '@/features/admin/BrandingTable/schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@repo/core/utils/supabase/client'
import { useMemo, useEffect } from 'react'
import { useBranding } from '@repo/core/hooks/admin/useBranding'

export const useBrandingTab = (tenantId: string) => {
    const supabase = useMemo(() => createClient(), [])
    const queryClient = useQueryClient()
    const { brandingConfig, isLoading } = useBranding(tenantId)

    const form = useForm<IBrandingFormValues>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            tenant_id: tenantId,
            company_name: '',
            app_name: '',
            logo_url: '',
            favicon_url: '',
            primary_color: '#3B82F6',
            secondary_color: '#8B5CF6',
            font_family: 'Inter, sans-serif',
            custom_css: '',
        },
    })

    useEffect(() => {
        if (brandingConfig) {
            form.reset({
                tenant_id: brandingConfig.tenant_id,
                company_name: brandingConfig.company_name || '',
                app_name: brandingConfig.app_name || '',
                logo_url: brandingConfig.logo_url || '',
                favicon_url: brandingConfig.favicon_url || '',
                primary_color: brandingConfig.primary_color || '#3B82F6',
                secondary_color: brandingConfig.secondary_color || '#8B5CF6',
                font_family: brandingConfig.font_family || 'Inter, sans-serif',
                custom_css: brandingConfig.custom_css || '',
            })
        }
    }, [brandingConfig, form])

    const mutation = useMutation({
        mutationFn: async (data: IBrandingFormValues) => {
            if (brandingConfig?.id) {
                const { data: updated, error } = await supabase
                    .from('whitelabel_configs')
                    .update(data)
                    .eq('id', brandingConfig.id)
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
            queryClient.invalidateQueries({ queryKey: ['branding', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenant-stats', tenantId] })
        },
    })

    const onSubmit = form.handleSubmit((data) => {
        mutation.mutate(data)
    })

    return {
        form,
        onSubmit,
        isSubmitting: mutation.isPending,
        brandingConfig,
        isLoading,
    }
}

