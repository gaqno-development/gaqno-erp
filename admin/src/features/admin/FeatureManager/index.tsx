'use client'
import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { useFeatureManager } from './hooks/useFeatureManager'

interface IFeatureManagerProps {
    tenantId: string
}

export const FeatureManager: React.FC<IFeatureManagerProps> = ({ tenantId }) => {
    const {
        features,
        isLoading,
        updateFeature,
    } = useFeatureManager(tenantId)

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
                    <h1 className="text-3xl font-bold tracking-tight">Feature Management</h1>
                    <p className="text-muted-foreground">
                        Configure available features for the selected tenant
                    </p>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{feature.name}</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={feature.enabled}
                                    onChange={(e) => updateFeature(feature.id, { enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                        <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {feature.category}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

FeatureManager.displayName = 'FeatureManager'

