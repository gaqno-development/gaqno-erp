'use client'
import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Input } from '@repo/ui/components/ui'
import { useBrandingManager } from './hooks/useBrandingManager'

interface IBrandingManagerProps {
    tenantId: string
}

export const BrandingManager: React.FC<IBrandingManagerProps> = ({ tenantId }) => {
    const {
        brandingConfig,
        isLoading,
        updateBranding,
        activeTab,
        setActiveTab
    } = useBrandingManager(tenantId)

    const [formData, setFormData] = React.useState({
        logo_url: '',
        primary_color: '#3B82F6',
        secondary_color: '#8B5CF6',
        app_name: '',
        custom_css: ''
    })

    React.useEffect(() => {
        if (brandingConfig) {
            setFormData({
                logo_url: brandingConfig.logo_url || '',
                primary_color: brandingConfig.primary_color || '#3B82F6',
                secondary_color: brandingConfig.secondary_color || '#8B5CF6',
                app_name: brandingConfig.app_name || '',
                custom_css: brandingConfig.custom_css || ''
            })
        }
    }, [brandingConfig])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateBranding(formData)
    }

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
                    <h1 className="text-3xl font-bold tracking-tight">Branding Management</h1>
                    <p className="text-muted-foreground">
                        Customize the appearance for the selected tenant
                    </p>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">App Name</label>
                            <Input
                                value={formData.app_name}
                                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                                placeholder="Enter app name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Logo URL</label>
                            <Input
                                value={formData.logo_url}
                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Primary Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={formData.primary_color}
                                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                        className="w-12 h-10 rounded border"
                                    />
                                    <Input
                                        value={formData.primary_color}
                                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={formData.secondary_color}
                                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                        className="w-12 h-10 rounded border"
                                    />
                                    <Input
                                        value={formData.secondary_color}
                                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                        placeholder="#8B5CF6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Custom CSS</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                                value={formData.custom_css}
                                onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                                placeholder=":root { --custom-spacing: 1.5rem; }"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

BrandingManager.displayName = 'BrandingManager'

