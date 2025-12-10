import { z } from 'zod'
import { strongPasswordSchema, confirmPasswordRefinement } from '@repo/core/lib/validations'

export const userSchema = z.object({
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: z.string()
        .email('E-mail inválido')
        .min(5, 'E-mail deve ter pelo menos 5 caracteres'),
    role: z.enum(['ADMIN', 'MANAGER', 'USER'], {
        errorMap: () => ({ message: 'Role deve ser ADMIN, MANAGER ou USER' }),
    }),
    tenant_id: z.string().min(1, 'Tenant ID é obrigatório'),
    department: z.string()
        .transform(val => val === '' ? null : val)
        .nullable()
        .optional(),
    avatar_url: z.string()
        .transform(val => val === '' ? null : val)
        .nullable()
        .refine((val) => val === null || z.string().url().safeParse(val).success, {
            message: 'URL inválida'
        })
        .optional(),
})

export const createUserSchema = userSchema.extend({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
}).refine(confirmPasswordRefinement, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
})

export type IUserFormValues = z.infer<typeof userSchema>
export type ICreateUserFormValues = z.infer<typeof createUserSchema>

