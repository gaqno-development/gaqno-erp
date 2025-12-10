'use client'

import React from 'react'
import { AnalyticsDashboard } from '@/features/admin/AnalyticsDashboard'
import { ITenant } from '@repo/core/types/admin'

interface IAnalyticsTabProps {
    tenant: ITenant
}

export const AnalyticsTab: React.FC<IAnalyticsTabProps> = ({ tenant }) => {
    return <AnalyticsDashboard tenantId={tenant.tenant_id} />
}

AnalyticsTab.displayName = 'AnalyticsTab'

