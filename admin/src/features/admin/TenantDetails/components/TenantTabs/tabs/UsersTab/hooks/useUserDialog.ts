import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, createUserSchema, IUserFormValues, ICreateUserFormValues } from '../schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@repo/core/utils/supabase/client'
import { useMemo, useEffect, useState } from 'react'
import { ITenantUser } from '@/features/admin/BrandingTable/types'
import axios, { AxiosError } from 'axios'

export const useUserDialog = (
    userData: ITenantUser | null | undefined,
    tenantId: string,
    onSuccess: () => void
) => {
    const supabase = useMemo(() => createClient(), [])
    const queryClient = useQueryClient()
    const isEdit = !!userData
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const form = useForm<ICreateUserFormValues>({
        resolver: zodResolver(isEdit ? userSchema : createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            role: 'USER',
            tenant_id: tenantId,
            department: '',
            avatar_url: '',
            password: '',
            confirmPassword: '',
        },
    })

    useEffect(() => {
        if (userData) {
            form.reset({
                name: userData.name || '',
                email: userData.email || '',
                role: userData.role as 'ADMIN' | 'MANAGER' | 'USER',
                tenant_id: tenantId,
                department: '',
                avatar_url: userData.avatar_url || '',
                password: '',
                confirmPassword: '',
            })
        } else {
            form.reset({
                name: '',
                email: '',
                role: 'USER',
                tenant_id: tenantId,
                department: '',
                avatar_url: '',
                password: '',
                confirmPassword: '',
            })
        }
    }, [userData, tenantId, form])

    const mutation = useMutation({
        mutationFn: async (data: ICreateUserFormValues | IUserFormValues) => {
            setErrorMessage(null)

            if (userData?.id) {
                const { password, confirmPassword, ...updateData } = data as ICreateUserFormValues

                const { data: updated, error } = await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', userData.id)
                    .select()
                    .single()

                if (error) throw error
                return updated
            } else {
                const { password, confirmPassword, ...profileData } = data as ICreateUserFormValues

                console.log('📤 Enviando para API:', profileData)

                try {
                    const response = await axios.post('/api/admin/users', {
                        email: profileData.email,
                        password: password,
                        name: profileData.name,
                        role: profileData.role,
                        tenant_id: profileData.tenant_id,
                        department: profileData.department,
                        avatar_url: profileData.avatar_url,
                    })

                    return response.data.data
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        const axiosError = error as AxiosError<{ error: string }>
                        throw new Error(axiosError.response?.data?.error || 'Erro ao criar usuário')
                    }
                    throw error
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenant-stats', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            setErrorMessage(null)
            onSuccess()
        },
        onError: (error: Error) => {
            setErrorMessage(error.message || 'Erro desconhecido ao processar a requisição')
        },
    })

    const onSubmit = form.handleSubmit((data) => {
        mutation.mutate(data)
    })

    return {
        form,
        onSubmit,
        isSubmitting: mutation.isPending,
        isEdit,
        errorMessage,
    }
}

