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
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { IUserDialogProps } from '../../types'
import { useUserDialog } from '../../hooks/useUserDialog'

export const UserDialog: React.FC<IUserDialogProps> = ({
    open,
    onOpenChange,
    userData,
    tenantId,
    tenantName,
}) => {
    const { form, onSubmit, isSubmitting, isEdit, errorMessage } = useUserDialog(
        userData,
        tenantId,
        () => onOpenChange(false)
    )

    const { register, formState: { errors }, watch } = form
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? `Editar Usuário - ${userData?.name}` : `Novo Usuário - ${tenantName}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    {errorMessage && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-destructive">Erro ao processar requisição</p>
                                <p className="text-sm text-destructive/90 mt-1">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo *</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="João Silva"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="joao@empresa.com"
                                disabled={isEdit}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Permissão *</Label>
                            <select
                                id="role"
                                {...register('role')}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="USER">Usuário</option>
                                <option value="MANAGER">Gerente</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                {watch('role') === 'ADMIN' && 'Acesso total ao sistema'}
                                {watch('role') === 'MANAGER' && 'Gerenciar equipe e configurações'}
                                {watch('role') === 'USER' && 'Acesso básico ao sistema'}
                            </p>
                            {errors.role && (
                                <p className="text-sm text-destructive">{errors.role.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Departamento</Label>
                            <Input
                                id="department"
                                {...register('department')}
                                placeholder="Tecnologia"
                            />
                            {errors.department && (
                                <p className="text-sm text-destructive">{errors.department.message}</p>
                            )}
                        </div>
                    </div>

                    {!isEdit && (
                        <>
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Definir Senha</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Senha *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                {...register('password')}
                                                placeholder="********"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-destructive">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                {...register('confirmPassword')}
                                                placeholder="********"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-sm text-destructive">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-muted p-3 rounded-lg mt-3">
                                    <p className="text-xs text-muted-foreground">
                                        A senha deve conter:
                                    </p>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                                        <li>Mínimo de 8 caracteres</li>
                                        <li>Pelo menos uma letra maiúscula</li>
                                        <li>Pelo menos uma letra minúscula</li>
                                        <li>Pelo menos um número</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Informações do Tenant</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Tenant:</span>
                                <span className="ml-2 font-medium">{tenantName}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Tenant ID:</span>
                                <code className="ml-2 bg-background px-2 py-1 rounded text-xs">
                                    {tenantId}
                                </code>
                            </div>
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
                            {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

UserDialog.displayName = 'UserDialog'

