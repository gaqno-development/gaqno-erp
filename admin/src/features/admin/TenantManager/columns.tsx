"use client"

import { Button } from "@repo/ui/components/ui/button"
import { formatDate } from "@repo/core/utils/date"

type TenantRow = {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'trial'
  max_users: number
  created_at: string
}

export interface TenantManagerColumnsHandlers {
  onEdit: (tenant: any) => void
}

export function createTenantManagerColumns(handlers: TenantManagerColumnsHandlers): any[] {
  const { onEdit } = handlers

  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }: { row: { original: TenantRow } }) => row.original.domain,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.original.status === 'active'
            ? 'bg-green-100 text-green-800'
            : row.original.status === 'trial'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'max_users',
      header: 'Max Users',
      cell: ({ row }: { row: { original: TenantRow } }) => row.original.max_users,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: TenantRow } }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: TenantRow } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ]
}


