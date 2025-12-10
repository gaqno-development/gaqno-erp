import { useState } from 'react'
import { useAnalytics } from '@repo/core/hooks/admin/useAnalytics'

export const useAnalyticsDashboard = (tenantId: string) => {
    const [timeRange, setTimeRange] = useState('30d')

    const { usageData, userActivityData, featureUsageData, isLoading } = useAnalytics(tenantId, timeRange)

    const exportReport = () => {
        const reportData = {
            usage: usageData,
            activity: userActivityData,
            features: featureUsageData,
            timestamp: new Date().toISOString()
        }

        const dataStr = JSON.stringify(reportData, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `analytics-report-${tenantId}-${new Date().toISOString().split('T')[0]}.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    return {
        timeRange,
        setTimeRange,
        usageData,
        userActivityData,
        featureUsageData,
        isLoading,
        exportReport
    }
}

