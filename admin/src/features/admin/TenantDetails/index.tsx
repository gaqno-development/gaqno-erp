'use client'

import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { ArrowLeft, Settings } from 'lucide-react'
import { useTenantDetails } from './hooks/useTenantDetails'
import { TenantTabs } from './components/TenantTabs'
import Link from 'next/link'
import { formatDate } from '@repo/core/utils/date'

interface ITenantDetailsProps {
    tenantId: string
}

export const TenantDetails: React.FC<ITenantDetailsProps> = ({ tenantId }) => {
    const { tenant, isLoading, activeTab, setActiveTab, handleEdit } = useTenantDetails(tenantId)

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tenants">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                </div>
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Tenant não encontrado</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tenants">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4">
                        {tenant.whitelabel_configs?.logo_url ? (
                            <img
                                src={tenant.whitelabel_configs.logo_url}
                                alt={tenant.whitelabel_configs.company_name || tenant.name}
                                className="w-16 h-16 object-contain rounded-lg border bg-white p-2"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl font-bold">
                                {tenant.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {tenant.whitelabel_configs?.company_name || tenant.name}
                            </h1>
                            <p className="text-muted-foreground">{tenant.domain}</p>
                            {tenant.whitelabel_configs?.app_name && (
                                <p className="text-sm text-muted-foreground">
                                    App: {tenant.whitelabel_configs.app_name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tenant.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : tenant.status === 'trial'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                    >
                        {tenant.status.toUpperCase()}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                    </Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex items-center gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Tenant ID:</span>
                        <code className="ml-2 bg-muted px-2 py-1 rounded">{tenant.tenant_id}</code>
                    </div>
                    <div className="border-l pl-4">
                        <span className="text-muted-foreground">Usuários:</span>
                        <span className="ml-2 font-medium">
                            {tenant.user_count} / {tenant.max_users}
                        </span>
                    </div>
                    <div className="border-l pl-4">
                        <span className="text-muted-foreground">Criado em:</span>
                        <span className="ml-2 font-medium">
                            {formatDate(tenant.created_at)}
                        </span>
                    </div>
                </div>
            </Card>

            <TenantTabs tenant={tenant} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    )
}

TenantDetails.displayName = 'TenantDetails'

