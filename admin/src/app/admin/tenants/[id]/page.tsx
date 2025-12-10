'use client'
import React from 'react'
import { TenantDetails } from '@/features/admin/TenantDetails'
import { useParams } from 'next/navigation'

export default function TenantDetailsPage() {
    const params = useParams()
    const tenantId = params.id as string

    return <TenantDetails tenantId={tenantId} />
}

