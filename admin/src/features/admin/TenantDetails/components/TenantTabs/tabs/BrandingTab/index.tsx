'use client'

import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { Label } from '@repo/ui/components/ui'
import { ITenant } from '@repo/core/types/admin'
import { Loader2, Upload } from 'lucide-react'
import { useBrandingTab } from './hooks/useBrandingTab'
import { ImageUploader } from '@/features/admin/BrandingTable/components/ImageUploader'

interface IBrandingTabProps {
    tenant: ITenant
}

export const BrandingTab: React.FC<IBrandingTabProps> = ({ tenant }) => {
    const { form, onSubmit, isSubmitting, brandingConfig, isLoading } = useBrandingTab(
        tenant.tenant_id
    )

    const { register, formState: { errors }, setValue, watch } = form

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Identidade Visual</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Logo da Empresa</Label>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Cores do Tema</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="primary_color">Cor Primária *</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        {...register('primary_color')}
                                        className="w-16 h-16 rounded-lg border-2 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <Input
                                            {...register('primary_color')}
                                            placeholder="#3B82F6"
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                                {errors.primary_color && (
                                    <p className="text-sm text-destructive">{errors.primary_color.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secondary_color">Cor Secundária *</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        {...register('secondary_color')}
                                        className="w-16 h-16 rounded-lg border-2 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <Input
                                            {...register('secondary_color')}
                                            placeholder="#8B5CF6"
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                                {errors.secondary_color && (
                                    <p className="text-sm text-destructive">{errors.secondary_color.message}</p>
                                )}
                            </div>
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
                            className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md font-mono"
                            placeholder=":root { --custom-variable: value; }"
                        />
                        {errors.custom_css && (
                            <p className="text-sm text-destructive">{errors.custom_css.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {brandingConfig ? 'Atualizar Branding' : 'Criar Branding'}
                        </Button>
                    </div>
                </form>
            </Card>

            {watch('logo_url') || watch('primary_color') || watch('secondary_color') ? (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Preview</h3>
                    <div
                        className="p-8 rounded-lg border-2"
                        style={{
                            backgroundColor: watch('primary_color') || '#3B82F6',
                            color: 'white',
                        }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            {watch('logo_url') && (
                                <img
                                    src={watch('logo_url') || ''}
                                    alt="Logo"
                                    className="h-12 w-auto object-contain bg-white p-2 rounded"
                                />
                            )}
                            <div>
                                <h4 className="text-2xl font-bold">{watch('company_name') || tenant.name}</h4>
                                <p className="opacity-90">{watch('app_name') || 'Aplicação'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 rounded"
                                style={{ backgroundColor: watch('secondary_color') || '#8B5CF6' }}
                            >
                                Botão Secundário
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-900 rounded">
                                Botão Branco
                            </button>
                        </div>
                    </div>
                </Card>
            ) : null}
        </div>
    )
}

BrandingTab.displayName = 'BrandingTab'

