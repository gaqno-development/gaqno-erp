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
import { Loader2 } from 'lucide-react'
import { ITenantDialogProps } from '../../types'
import { useTenantDialog } from './hooks/useTenantDialog'

export const TenantDialog: React.FC<ITenantDialogProps> = ({
    open,
    onOpenChange,
    tenantData,
}) => {
    const { form, onSubmit, isSubmitting } = useTenantDialog(
        tenantData,
        () => onOpenChange(false)
    )

    const { register, formState: { errors }, watch } = form

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {tenantData ? 'Editar Tenant' : 'Novo Tenant'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tenant_id">Tenant ID *</Label>
                        <Input
                            id="tenant_id"
                            {...register('tenant_id')}
                            placeholder="empresa-inc"
                            disabled={!!tenantData}
                        />
                        <p className="text-xs text-muted-foreground">
                            Apenas letras minúsculas, números e hífens
                        </p>
                        {errors.tenant_id && (
                            <p className="text-sm text-destructive">{errors.tenant_id.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Empresa *</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Empresa Inc."
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domain">Domínio *</Label>
                        <Input
                            id="domain"
                            {...register('domain')}
                            placeholder="empresa.com.br"
                        />
                        <p className="text-xs text-muted-foreground">
                            Domínio principal da empresa
                        </p>
                        {errors.domain && (
                            <p className="text-sm text-destructive">{errors.domain.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <select
                                id="status"
                                {...register('status')}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="trial">Trial</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.status && (
                                <p className="text-sm text-destructive">{errors.status.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_users">Máximo de Usuários *</Label>
                            <Input
                                id="max_users"
                                type="number"
                                {...register('max_users', { valueAsNumber: true })}
                                placeholder="10"
                                min={1}
                                max={10000}
                            />
                            {errors.max_users && (
                                <p className="text-sm text-destructive">{errors.max_users.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Preview</h4>
                        <div className="text-sm space-y-1">
                            <p>
                                <span className="text-muted-foreground">Tenant ID:</span>{' '}
                                <code className="bg-background px-2 py-1 rounded">
                                    {watch('tenant_id') || 'tenant-id'}
                                </code>
                            </p>
                            <p>
                                <span className="text-muted-foreground">URL:</span>{' '}
                                <code className="bg-background px-2 py-1 rounded">
                                    {watch('domain') || 'example.com'}
                                </code>
                            </p>
                            <p>
                                <span className="text-muted-foreground">Usuários:</span>{' '}
                                <span className="font-medium">0 / {watch('max_users') || 10}</span>
                            </p>
                        </div>
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
                            {tenantData ? 'Salvar Alterações' : 'Criar Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

TenantDialog.displayName = 'TenantDialog'

