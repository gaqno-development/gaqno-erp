'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@repo/ui/components/ui'
import { Card } from '@repo/ui/components/ui'
import { Users, Rocket, Globe, Palette, CheckCircle2, XCircle } from 'lucide-react'
import { ITenantStatsDialogProps } from '../../types'
import { useTenantStats } from '../../hooks/useTenantStats'
import { formatDate } from '@repo/core/utils/date'

export const TenantStatsDialog: React.FC<ITenantStatsDialogProps> = ({
    open,
    onOpenChange,
    tenant,
}) => {
    const { stats, isLoading } = useTenantStats(tenant.tenant_id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Estatísticas - {tenant.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Visão geral do tenant e recursos
                    </p>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : stats ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.total_users}</p>
                                        <p className="text-xs text-muted-foreground">Usuários</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Rocket className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.enabled_features}</p>
                                        <p className="text-xs text-muted-foreground">Features</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Globe className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.verified_domains}</p>
                                        <p className="text-xs text-muted-foreground">Domínios</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Palette className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {stats.has_branding ? '✓' : '✗'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Branding</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Usuários
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total</span>
                                        <span className="font-semibold">{stats.total_users}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Limite</span>
                                        <span className="font-semibold">{tenant.max_users}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Disponível</span>
                                        <span className="font-semibold">
                                            {tenant.max_users - stats.total_users}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(stats.total_users / tenant.max_users) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Rocket className="h-4 w-4" />
                                    Features
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Ativas</span>
                                        <span className="font-semibold text-green-600">
                                            {stats.enabled_features}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total</span>
                                        <span className="font-semibold">{stats.total_features}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Taxa de Ativação
                                        </span>
                                        <span className="font-semibold">
                                            {stats.total_features > 0
                                                ? Math.round(
                                                    (stats.enabled_features / stats.total_features) * 100
                                                )
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Domínios
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total</span>
                                        <span className="font-semibold">{stats.total_domains}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Verificados</span>
                                        <span className="font-semibold text-green-600 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {stats.verified_domains}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Não Verificados
                                        </span>
                                        <span className="font-semibold text-orange-600 flex items-center gap-1">
                                            <XCircle className="h-3 w-3" />
                                            {stats.total_domains - stats.verified_domains}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Branding
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Configurado
                                        </span>
                                        <span
                                            className={`font-semibold ${stats.has_branding ? 'text-green-600' : 'text-orange-600'
                                                }`}
                                        >
                                            {stats.has_branding ? 'Sim' : 'Não'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stats.has_branding
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}
                                        >
                                            {stats.has_branding ? 'Completo' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card className="p-4 bg-muted/50">
                            <h4 className="font-semibold mb-2">Informações do Tenant</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Tenant ID:</span>
                                    <code className="ml-2 bg-background px-2 py-1 rounded">
                                        {tenant.tenant_id}
                                    </code>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Domínio:</span>
                                    <span className="ml-2 font-medium">{tenant.domain}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="ml-2 font-medium capitalize">
                                        {tenant.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Criado em:</span>
                                    <span className="ml-2 font-medium">
                                        {formatDate(tenant.created_at)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">
                            Não foi possível carregar as estatísticas
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

TenantStatsDialog.displayName = 'TenantStatsDialog'

