'use client'

import React from 'react'
import { FeatureManager } from '@/features/admin/FeatureManager'
import { ITenant } from '@repo/core/types/admin'

interface IFeaturesTabProps {
    tenant: ITenant
}

export const FeaturesTab: React.FC<IFeaturesTabProps> = ({ tenant }) => {
    return <FeatureManager tenantId={tenant.tenant_id} />
}

FeaturesTab.displayName = 'FeaturesTab'

