'use client'
import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { useAnalyticsDashboard } from './hooks/useAnalyticsDashboard'

interface IAnalyticsDashboardProps {
    tenantId: string
}

export const AnalyticsDashboard: React.FC<IAnalyticsDashboardProps> = ({ tenantId }) => {
    const {
        timeRange,
        setTimeRange,
        usageData,
        isLoading,
        exportReport
    } = useAnalyticsDashboard(tenantId)

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor usage and activity for the selected tenant
                    </p>
                </div>
                <div className="flex space-x-2">
                    <select
                        className="px-3 py-2 border rounded-md"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                    <Button variant="outline" onClick={exportReport}>
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Users</h3>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{usageData.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            +{usageData.newUsers} from last period
                        </p>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Active Users</h3>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{usageData.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {usageData.activePercentage}% of total users
                        </p>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">API Calls</h3>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{usageData.apiCalls.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            +{usageData.apiCallsChange}% from last period
                        </p>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Storage Used</h3>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{usageData.storageUsed}GB</div>
                        <p className="text-xs text-muted-foreground">
                            {usageData.storagePercentage}% of allocated space
                        </p>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
                <div className="flex justify-center items-center h-64 text-muted-foreground">
                    Chart visualization will be displayed here
                </div>
            </Card>
        </div>
    )
}

AnalyticsDashboard.displayName = 'AnalyticsDashboard'

