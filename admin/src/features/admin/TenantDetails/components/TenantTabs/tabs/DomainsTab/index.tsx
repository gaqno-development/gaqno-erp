'use client'

import React from 'react'
import { DomainManager } from '@/features/admin/DomainManager'
import { ITenant } from '@repo/core/types/admin'

interface IDomainsTabProps {
    tenant: ITenant
}

export const DomainsTab: React.FC<IDomainsTabProps> = ({ tenant }) => {
    return <DomainManager tenantId={tenant.tenant_id} />
}

DomainsTab.displayName = 'DomainsTab'

