import { z } from 'zod'

export const brandingSchema = z.object({
    tenant_id: z.string().min(1, 'Tenant ID é obrigatório'),
    company_name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
    app_name: z.string().min(2, 'Nome do app deve ter pelo menos 2 caracteres').nullable().optional(),
    logo_url: z.string().url('URL inválida').nullable().optional(),
    favicon_url: z.string().url('URL inválida').nullable().optional(),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor primária inválida'),
    secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor secundária inválida'),
    font_family: z.string().nullable().optional(),
    custom_css: z.string().nullable().optional(),
})

export const brandingUploadSchema = z.object({
    file: z.instanceof(File).refine((file) => file.size <= 5000000, {
        message: 'O arquivo deve ter no máximo 5MB',
    }).refine(
        (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type),
        { message: 'Apenas arquivos JPG, PNG, WEBP ou SVG são permitidos' }
    ),
})

export type IBrandingFormValues = z.infer<typeof brandingSchema>
export type IBrandingUploadValues = z.infer<typeof brandingUploadSchema>

