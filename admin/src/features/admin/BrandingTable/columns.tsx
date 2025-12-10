"use client"

import { IBrandingConfig } from "@repo/core/types/admin"
import { Button } from "@repo/ui/components/ui/button"
import { Users, Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@repo/core/utils/date"

export interface BrandingColumnsHandlers {
    onViewUsers: (tenantId: string) => void
    onEdit: (branding: IBrandingConfig) => void
    onDelete: (id: string) => void
}

export function createBrandingColumns(handlers: BrandingColumnsHandlers): any[] {
    const { onViewUsers, onEdit, onDelete } = handlers

    return [
        {
            accessorKey: "logo_url",
            header: "Logo",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => {
                const branding = row.original
                return branding.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={branding.logo_url}
                        alt={branding.company_name || "Logo"}
                        className="w-10 h-10 object-contain rounded"
                    />
                ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">N/A</div>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "company_name",
            header: "Empresa",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => row.original.company_name || "-",
        },
        {
            accessorKey: "app_name",
            header: "App Name",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => row.original.app_name || "-",
        },
        {
            accessorKey: "tenant_id",
            header: "Tenant ID",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => (
                <code className="text-xs bg-muted px-2 py-1 rounded">{row.original.tenant_id}</code>
            ),
        },
        {
            id: "colors",
            header: "Cores",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => {
                const branding = row.original
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: branding.primary_color }}
                            title={`Primary: ${branding.primary_color}`}
                        />
                        <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: branding.secondary_color }}
                            title={`Secondary: ${branding.secondary_color}`}
                        />
                    </div>
                )
            },
            enableSorting: false,
        },
        {
            accessorKey: "created_at",
            header: "Criado",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>,
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }: { row: { original: IBrandingConfig } }) => {
                const branding = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUsers(branding.tenant_id)}
                            title="Ver usuários"
                        >
                            <Users className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(branding)}
                            title="Editar"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(branding.id)}
                            title="Excluir"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
    ]
}
