import { z } from 'zod'
import { passwordSchema, confirmPasswordRefinement } from '@repo/core/lib/validations'

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(confirmPasswordRefinement, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export type IRegisterFormValues = z.infer<typeof registerSchema>

