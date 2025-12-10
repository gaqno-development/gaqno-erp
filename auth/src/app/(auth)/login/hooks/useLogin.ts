'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, ILoginFormValues } from '../schema'
import { useMutation } from '@tanstack/react-query'
import { ROUTES } from '@repo/core/lib/constants'
import { createClient } from '@repo/core/utils/supabase/client'

export const useLogin = () => {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ILoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: ILoginFormValues) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      router.push(ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      form.setError('root', {
        message: error.message || 'Erro ao fazer login',
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

