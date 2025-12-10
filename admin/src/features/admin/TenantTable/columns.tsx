"use client"

import { Button } from "@repo/ui/components/ui/button"
import { formatDate } from "@repo/core/utils/date"
import { Users, Palette, Globe, Rocket, BarChart3, ExternalLink, Pencil } from "lucide-react"
import Link from "next/link"

export type TenantRow = {
  id: string
  tenant_id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'trial'
  user_count: number
  max_users: number
  created_at: string
  whitelabel_configs?: {
    logo_url: string | null
    company_name: string | null
  } | null
}

export interface TenantTableColumnsHandlers {
  onEdit: (tenant: any) => void
  onViewUsers: (tenant: any) => void
}

export function createTenantTableColumns(handlers: TenantTableColumnsHandlers): any[] {
  const { onEdit, onViewUsers } = handlers

  return [
    {
      id: 'tenant',
      header: 'Tenant',
      cell: ({ row }: { row: { original: TenantRow } }) => {
        const t = row.original
        return (
          <div className="p-0">
            <div className="flex items-center gap-3">
              {t.whitelabel_configs?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.whitelabel_configs.logo_url}
                  alt={t.whitelabel_configs.company_name || t.name}
                  className="w-10 h-10 object-contain rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-sm font-bold">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-base">
                  {t.whitelabel_configs?.company_name || t.name}
                </span>
                <span className="text-sm text-muted-foreground">{t.domain}</span>
                <code className="text-xs bg-muted px-2 py-1 rounded w-fit">{t.tenant_id}</code>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${row.original.status === 'active'
            ? 'bg-green-100 text-green-800 border-green-200'
            : row.original.status === 'trial'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          {row.original.status.toUpperCase()}
        </span>
      ),
    },
    {
      id: 'users',
      header: 'Usuários',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {row.original.user_count} / {row.original.max_users}
            </span>
          </div>
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${row.original.user_count < row.original.max_users * 0.8
                ? 'bg-green-600'
                : row.original.user_count < row.original.max_users
                  ? 'bg-orange-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${(row.original.user_count / row.original.max_users) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'features',
      header: 'Recursos',
      cell: () => (
        <div className="flex gap-1">
          <div className="p-1.5 bg-orange-100 rounded" title="Branding">
            <Palette className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <div className="p-1.5 bg-green-100 rounded" title="Domínios">
            <Globe className="h-3.5 w-3.5 text-green-600" />
          </div>
          <div className="p-1.5 bg-purple-100 rounded" title="Features">
            <Rocket className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="p-1.5 bg-blue-100 rounded" title="Analytics">
            <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
          </div>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Data',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{formatDate(row.original.created_at)}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/tenants/${row.original.tenant_id}`}>
            <Button variant="default" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Detalhes
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original as any)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onViewUsers(row.original as any)}>
            <Users className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
}
