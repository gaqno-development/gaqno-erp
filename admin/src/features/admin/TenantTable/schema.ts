import { z } from 'zod'

export const tenantSchema = z.object({
    tenant_id: z.string()
        .min(3, 'Tenant ID deve ter pelo menos 3 caracteres')
        .max(50, 'Tenant ID deve ter no máximo 50 caracteres')
        .regex(/^[a-z0-9-]+$/, 'Tenant ID deve conter apenas letras minúsculas, números e hífens'),
    name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    domain: z.string()
        .min(3, 'Domínio deve ter pelo menos 3 caracteres')
        .max(255, 'Domínio deve ter no máximo 255 caracteres')
        .regex(
            /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i,
            'Formato de domínio inválido (ex: empresa.com.br)'
        ),
    status: z.enum(['active', 'inactive', 'trial'], {
        errorMap: () => ({ message: 'Status deve ser active, inactive ou trial' }),
    }),
    max_users: z.number()
        .int('Deve ser um número inteiro')
        .min(1, 'Deve ter pelo menos 1 usuário')
        .max(10000, 'Máximo de 10000 usuários'),
})

export type ITenantFormValues = z.infer<typeof tenantSchema>

