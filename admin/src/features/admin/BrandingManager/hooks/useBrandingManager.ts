import { useState, useEffect } from 'react'
import { useBranding } from '@repo/core/hooks/admin/useBranding'
import { IBrandingConfig } from '@repo/core/types/admin'

export const useBrandingManager = (tenantId: string) => {
    const [previewMode, setPreviewMode] = useState(false)
    const [activeTab, setActiveTab] = useState('general')

    const {
        brandingConfig,
        isLoading,
        updateBranding: updateBrandingConfig
    } = useBranding(tenantId)

    const updateBranding = async (data: Partial<IBrandingConfig>) => {
        const result = await updateBrandingConfig(data)
        return result
    }

    return {
        brandingConfig,
        isLoading,
        updateBranding,
        previewMode,
        setPreviewMode,
        activeTab,
        setActiveTab
    }
}

