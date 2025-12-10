'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { Upload, Loader2 } from 'lucide-react'
import { IBrandingDialogProps } from '../../types'
import { useBrandingDialog } from './hooks/useBrandingDialog'
import { ImageUploader } from '../ImageUploader'

export const BrandingDialog: React.FC<IBrandingDialogProps> = ({
    open,
    onOpenChange,
    brandingData,
}) => {
    const { form, onSubmit, isSubmitting } = useBrandingDialog(
        brandingData,
        () => onOpenChange(false)
    )

    const { register, formState: { errors }, setValue, watch } = form

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {brandingData ? 'Editar Branding' : 'Nova Configuração de Branding'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tenant_id">Tenant ID *</Label>
                        <Input
                            id="tenant_id"
                            {...register('tenant_id')}
                            placeholder="company-id"
                            disabled={!!brandingData}
                        />
                        {errors.tenant_id && (
                            <p className="text-sm text-destructive">{errors.tenant_id.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company_name">Nome da Empresa *</Label>
                        <Input
                            id="company_name"
                            {...register('company_name')}
                            placeholder="Minha Empresa"
                        />
                        {errors.company_name && (
                            <p className="text-sm text-destructive">{errors.company_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="app_name">Nome do App</Label>
                        <Input
                            id="app_name"
                            {...register('app_name')}
                            placeholder="Meu App"
                        />
                        {errors.app_name && (
                            <p className="text-sm text-destructive">{errors.app_name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <ImageUploader
                                onUploadSuccess={(url) => setValue('logo_url', url)}
                                currentImageUrl={watch('logo_url') || undefined}
                                folder="logos"
                            />
                            {errors.logo_url && (
                                <p className="text-sm text-destructive">{errors.logo_url.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Favicon</Label>
                            <ImageUploader
                                onUploadSuccess={(url) => setValue('favicon_url', url)}
                                currentImageUrl={watch('favicon_url') || undefined}
                                folder="favicons"
                            />
                            {errors.favicon_url && (
                                <p className="text-sm text-destructive">{errors.favicon_url.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primary_color">Cor Primária *</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    {...register('primary_color')}
                                    className="w-12 h-10 rounded border cursor-pointer"
                                />
                                <Input
                                    {...register('primary_color')}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                            {errors.primary_color && (
                                <p className="text-sm text-destructive">{errors.primary_color.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondary_color">Cor Secundária *</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    {...register('secondary_color')}
                                    className="w-12 h-10 rounded border cursor-pointer"
                                />
                                <Input
                                    {...register('secondary_color')}
                                    placeholder="#8B5CF6"
                                    className="flex-1"
                                />
                            </div>
                            {errors.secondary_color && (
                                <p className="text-sm text-destructive">{errors.secondary_color.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="font_family">Fonte</Label>
                        <Input
                            id="font_family"
                            {...register('font_family')}
                            placeholder="Inter, sans-serif"
                        />
                        {errors.font_family && (
                            <p className="text-sm text-destructive">{errors.font_family.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom_css">CSS Customizado</Label>
                        <textarea
                            id="custom_css"
                            {...register('custom_css')}
                            className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                            placeholder=":root { --custom-variable: value; }"
                        />
                        {errors.custom_css && (
                            <p className="text-sm text-destructive">{errors.custom_css.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {brandingData ? 'Salvar Alterações' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

BrandingDialog.displayName = 'BrandingDialog'

