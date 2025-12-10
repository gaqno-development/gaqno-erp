'use client'

import React from 'react'
import { DashboardLayout } from '@repo/ui/components'
import { AppProvider } from '@repo/ui/components/providers'
import { WhiteLabelProvider } from '@repo/ui/components/providers'
import { ToastContainer } from '@repo/ui/components/ui'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <WhiteLabelProvider>
        <DashboardLayout>{children}</DashboardLayout>
        <ToastContainer />
      </WhiteLabelProvider>
    </AppProvider>
  )
}

