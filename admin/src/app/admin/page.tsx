'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
    const router = useRouter()

    useEffect(() => {
        router.push('/admin/tenants')
    }, [router])

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
}

