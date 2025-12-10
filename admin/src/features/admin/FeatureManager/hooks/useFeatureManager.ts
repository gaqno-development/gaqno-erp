import { useState } from 'react'
import { useFeatures } from '@repo/core/hooks/admin/useFeatures'
import { IFeature } from '@repo/core/types/admin'

export const useFeatureManager = (tenantId: string) => {
    const { features, isLoading, updateFeature: updateFeatureStatus } = useFeatures(tenantId)
    const [hasChanges, setHasChanges] = useState(false)

    const updateFeature = async (featureId: string, data: { enabled: boolean }) => {
        await updateFeatureStatus(featureId, data)
        setHasChanges(true)
    }

    const resetToDefaults = () => {
        setHasChanges(false)
    }

    const saveChanges = () => {
        setHasChanges(false)
    }

    return {
        features,
        isLoading,
        updateFeature,
        resetToDefaults,
        saveChanges,
        hasChanges
    }
}

