'use client'

import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import {
    Pencil,
    Trash2,
    Users,
    BarChart3,
    Palette,
    Globe,
    Rocket,
    ExternalLink,
} from 'lucide-react'
import { ITenantCardProps } from '../../types'
import Link from 'next/link'
import { formatDate } from '@repo/core/utils/date'

export const TenantCard: React.FC<ITenantCardProps> = ({
    tenant,
    onEdit,
    onDelete,
    onViewUsers,
    onViewStats,
}) => {
    const getStatusColor = () => {
        const statusColors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            trial: 'bg-blue-100 text-blue-800 border-blue-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        }
        return statusColors[tenant.status] || statusColors.inactive
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            {tenant.whitelabel_configs?.logo_url ? (
                                <img
                                    src={tenant.whitelabel_configs.logo_url}
                                    alt={tenant.whitelabel_configs.company_name || tenant.name}
                                    className="w-8 h-8 object-contain rounded"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                                    {tenant.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold truncate">
                                    {tenant.whitelabel_configs?.company_name || tenant.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {tenant.domain}
                                </p>
                            </div>
                        </div>
                        <code className="text-xs bg-muted px-2 py-1 rounded inline-block">
                            {tenant.tenant_id}
                        </code>
                    </div>
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
                    >
                        {tenant.status.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                    <div>
                        <p className="text-xs text-muted-foreground">Usuários</p>
                        <p className="text-lg font-semibold">
                            {tenant.user_count} / {tenant.max_users}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Criado em</p>
                        <p className="text-sm font-medium">
                            {formatDate(tenant.created_at)}
                        </p>
                    </div>
                </div>

                <Link href={`/admin/tenants/${tenant.tenant_id}`}>
                    <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Ver Detalhes Completos</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Palette className="h-3 w-3" /> Branding
                            </span>
                            <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Domínios
                            </span>
                            <span className="flex items-center gap-1">
                                <Rocket className="h-3 w-3" /> Features
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="flex items-center gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewUsers(tenant)}
                        className="flex-1"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Usuários
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(tenant)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(tenant.id)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

TenantCard.displayName = 'TenantCard'

