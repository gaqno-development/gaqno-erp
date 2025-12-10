'use client'

import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { ITenant } from '@repo/core/types/admin'
import { Users, Rocket, Globe, Palette, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { useTenantStats } from '@/features/admin/TenantTable/hooks/useTenantStats'
import { formatDate } from '@repo/core/utils/date'

interface IOverviewTabProps {
    tenant: ITenant
}

export const OverviewTab: React.FC<IOverviewTabProps> = ({ tenant }) => {
    const { stats, isLoading } = useTenantStats(tenant.tenant_id)

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Não foi possível carregar as estatísticas</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_users}</p>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Limite: {tenant.max_users}</span>
                            <span>{Math.round((stats.total_users / tenant.max_users) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(stats.total_users / tenant.max_users) * 100}%` }}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Rocket className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{stats.enabled_features}</p>
                    <p className="text-sm text-muted-foreground">Features Ativas</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {stats.total_features} disponíveis
                    </p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Globe className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{stats.verified_domains}</p>
                    <p className="text-sm text-muted-foreground">Domínios Verificados</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {stats.total_domains} total
                    </p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Palette className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">
                        {stats.has_branding ? (
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        ) : (
                            <XCircle className="h-8 w-8 text-orange-600" />
                        )}
                    </p>
                    <p className="text-sm text-muted-foreground">Branding</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {stats.has_branding ? 'Configurado' : 'Pendente'}
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Informações do Tenant</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Tenant ID</span>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{tenant.tenant_id}</code>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Nome</span>
                            <span className="font-medium">{tenant.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Domínio</span>
                            <span className="font-medium">{tenant.domain}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Status</span>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tenant.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : tenant.status === 'trial'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {tenant.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Criado em</span>
                            <span className="font-medium">
                                {formatDate(tenant.created_at, {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Status dos Recursos</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium">Usuários</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.total_users} de {tenant.max_users}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`text-sm font-semibold ${stats.total_users < tenant.max_users * 0.8
                                    ? 'text-green-600'
                                    : stats.total_users < tenant.max_users
                                        ? 'text-orange-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                {Math.round((stats.total_users / tenant.max_users) * 100)}%
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                                <Rocket className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="font-medium">Features</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.enabled_features} ativas
                                    </p>
                                </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium">Domínios</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.verified_domains} verificados
                                    </p>
                                </div>
                            </div>
                            {stats.verified_domains > 0 ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-orange-600" />
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-medium">Branding</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.has_branding ? 'Configurado' : 'Não configurado'}
                                    </p>
                                </div>
                            </div>
                            {stats.has_branding ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-orange-600" />
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

OverviewTab.displayName = 'OverviewTab'

