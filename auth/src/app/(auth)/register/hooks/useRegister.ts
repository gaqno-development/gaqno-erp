'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, IRegisterFormValues } from '../schema'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@repo/core/utils/supabase/client'
import { ROUTES } from '@repo/core/lib/constants'
import { UserRole } from '@repo/core/types/user'

export const useRegister = () => {
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<IRegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: IRegisterFormValues) => {
      const browserLocale = typeof window !== 'undefined' ? navigator.language || (Intl.DateTimeFormat().resolvedOptions().locale) : 'pt-BR'
      const inferredCountryIso = (browserLocale?.split('-')[1] || 'BR').toUpperCase()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role: UserRole.USER,
            country_iso: inferredCountryIso,
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado')
        }
        throw authError
      }

      if (!authData.user) throw new Error('Falha ao criar usuário')

      // Wait for the trigger to create the profile
      let retries = 10
      let profile = null

      while (retries > 0 && !profile) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .maybeSingle()

        profile = profileData
        retries--
      }

      // The trigger should have created the profile, but if it didn't, 
      // we'll let the user continue anyway since the profile can be created later
      if (!profile) {
        console.warn('Profile not created by trigger, but user registration succeeded')
      }

      return authData
    },
    onSuccess: () => {
      router.push(ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      const errorMessage = error.message.includes('User already registered')
        ? 'Este email já está cadastrado'
        : error.message || 'Erro ao registrar'

      form.setError('root', {
        message: errorMessage,
      })
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    error: form.formState.errors.root?.message,
  }
}

