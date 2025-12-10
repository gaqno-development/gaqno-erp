"use client"

import { IDomain } from "@repo/core/types/admin"
import { Button } from "@repo/ui/components/ui/button"
import { formatDate } from "@repo/core/utils/date"

export interface DomainColumnsHandlers {
  onVerify: (id: string) => void
}

export function createDomainColumns(handlers: DomainColumnsHandlers): any[] {
  const { onVerify } = handlers

  return [
    {
      accessorKey: "name",
      header: "Domain",
      cell: ({ row }: { row: { original: IDomain } }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: "verified",
      header: "Status",
      cell: ({ row }: { row: { original: IDomain } }) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.original.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {row.original.verified ? 'Verified' : 'Not Verified'}
        </span>
      ),
    },
    {
      id: "ssl",
      header: "SSL Certificate",
      cell: ({ row }: { row: { original: IDomain } }) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.original.ssl_certificate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {row.original.ssl_certificate ? 'Active' : 'Not Active'}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Added",
      cell: ({ row }: { row: { original: IDomain } }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: IDomain } }) => (
        <div className="flex items-center gap-2">
          {!row.original.verified && (
            <Button variant="outline" size="sm" onClick={() => onVerify(row.original.id)}>
              Verify
            </Button>
          )}
        </div>
      ),
    },
  ]
}



