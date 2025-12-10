'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { IUserFeaturePermission, FeatureModule, FeaturePermissionLevel } from '@repo/core/types/user'
import { formatFeatureLabel, formatRoleLabel } from '@repo/core/lib/permissions'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@repo/ui/components/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui'
import { Badge } from '@repo/ui/components/ui'

interface IUserPermissionView extends IUserFeaturePermission {
  user_name?: string
  user_email?: string
  tenant_name?: string
}

export default function RootAdminPermissionsPage() {
  const supabase = useSupabaseClient()
  const [permissions, setPermissions] = useState<IUserPermissionView[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_feature_permissions')
        .select(`
          *,
          profiles!user_feature_permissions_profile_id_fkey(name, email),
          tenants!inner(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = (data || []).map((perm: any) => ({
        ...perm,
        user_name: perm.profiles?.name,
        user_email: perm.profiles?.email,
        tenant_name: perm.tenants?.name,
      }))

      setPermissions(formatted)
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPermissions = permissions.filter((perm) => {
    if (filter === 'all') return true
    return perm.feature_key === filter
  })

  const groupedByUser = filteredPermissions.reduce((acc, perm) => {
    const key = perm.user_id
    if (!acc[key]) {
      acc[key] = {
        user_id: perm.user_id,
        user_name: perm.user_name || 'Unknown',
        user_email: perm.user_email || '',
        tenant_name: perm.tenant_name || 'No Tenant',
        permissions: [],
      }
    }
    acc[key].permissions.push(perm)
    return acc
  }, {} as Record<string, { user_id: string; user_name: string; user_email: string; tenant_name: string; permissions: IUserPermissionView[] }>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permission Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all user feature permissions across tenants
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Feature</CardTitle>
          <CardDescription>View permissions for specific features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All Features
            </button>
            {Object.values(FeatureModule)
              .filter((f) => f !== FeatureModule.SYSTEM)
              .map((feature) => (
                <button
                  key={feature}
                  onClick={() => setFilter(feature)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === feature
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {formatFeatureLabel(feature)}
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            {filteredPermissions.length} permission(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(groupedByUser).map((userGroup) => (
                <TableRow key={userGroup.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userGroup.user_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {userGroup.user_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{userGroup.tenant_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {userGroup.permissions.map((perm) => (
                        <Badge key={perm.id} variant="secondary">
                          {formatFeatureLabel(perm.feature_key as FeatureModule)}:{' '}
                          {formatRoleLabel(perm.role_key as FeaturePermissionLevel)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

