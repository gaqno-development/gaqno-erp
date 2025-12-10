'use client'

import React from 'react'
import { ITenant } from '@repo/core/types/admin'
import { TTenantTab } from '../../hooks/useTenantDetails'
import {
    LayoutDashboard,
    Palette,
    Users,
    Globe,
    Rocket,
    BarChart3
} from 'lucide-react'
import { OverviewTab } from './tabs/OverviewTab'
import { BrandingTab } from './tabs/BrandingTab'
import { UsersTab } from './tabs/UsersTab'
import { DomainsTab } from './tabs/DomainsTab'
import { FeaturesTab } from './tabs/FeaturesTab'
import { AnalyticsTab } from './tabs/AnalyticsTab'

interface ITenantTabsProps {
    tenant: ITenant
    activeTab: TTenantTab
    onTabChange: (tab: TTenantTab) => void
}

export const TenantTabs: React.FC<ITenantTabsProps> = ({
    tenant,
    activeTab,
    onTabChange,
}) => {
    const tabs = [
        { id: 'overview' as TTenantTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'branding' as TTenantTab, label: 'Branding', icon: Palette },
        { id: 'users' as TTenantTab, label: 'Usuários', icon: Users },
        { id: 'domains' as TTenantTab, label: 'Domínios', icon: Globe },
        { id: 'features' as TTenantTab, label: 'Features', icon: Rocket },
        { id: 'analytics' as TTenantTab, label: 'Analytics', icon: BarChart3 },
    ]

    return (
        <div className="space-y-6">
            <div className="border-b">
                <nav className="flex space-x-4 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${activeTab === tab.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div>
                {activeTab === 'overview' && <OverviewTab tenant={tenant} />}
                {activeTab === 'branding' && <BrandingTab tenant={tenant} />}
                {activeTab === 'users' && <UsersTab tenant={tenant} />}
                {activeTab === 'domains' && <DomainsTab tenant={tenant} />}
                {activeTab === 'features' && <FeaturesTab tenant={tenant} />}
                {activeTab === 'analytics' && <AnalyticsTab tenant={tenant} />}
            </div>
        </div>
    )
}

TenantTabs.displayName = 'TenantTabs'

