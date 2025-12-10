'use client'

import { FeatureGuard } from '@repo/ui/components/guards'
import { FeatureModule, FeaturePermissionLevel } from '@repo/core/types/user'

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FeatureGuard feature={FeatureModule.FINANCE} minRole={FeaturePermissionLevel.ACCESS}>
      {children}
    </FeatureGuard>
  )
}

