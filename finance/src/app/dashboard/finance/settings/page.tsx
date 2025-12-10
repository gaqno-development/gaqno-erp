'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@repo/core/hooks/useSupabaseClient'
import { useTenant } from '@repo/core/contexts/TenantContext'
import { FeatureModule, FeaturePermissionLevel, IUserFeaturePermission } from '@repo/core/types/user'
import { formatRoleLabel } from '@repo/core/lib/permissions'
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
import { Button } from '@repo/ui/components/ui'
import { usePermissions } from '@repo/core/hooks/usePermissions'

interface IFinanceUser extends IUserFeaturePermission {
  user_name?: string
  user_email?: string
}

export default function FinanceSettingsPage() {
  const supabase = useSupabaseClient()
  const { tenantId } = useTenant()
  const { canManage } = usePermissions()
  const [users, setUsers] = useState<IFinanceUser[]>([])
  const [loading, setLoading] = useState(true)

  const canManageRoles = canManage(FeatureModule.FINANCE, tenantId)

  useEffect(() => {
    loadFinanceUsers()
  }, [tenantId])

  const loadFinanceUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_feature_permissions')
        .select(`
          *,
          profiles!user_feature_permissions_profile_id_fkey(name, email)
        `)
        .eq('feature_key', FeatureModule.FINANCE)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = (data || []).map((perm: any) => ({
        ...perm,
        user_name: perm.profiles?.name,
        user_email: perm.profiles?.email,
      }))

      setUsers(formatted)
    } catch (error) {
      console.error('Error loading finance users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case FeaturePermissionLevel.ADMIN:
        return 'default'
      case FeaturePermissionLevel.MANAGER:
        return 'secondary'
      case FeaturePermissionLevel.USER:
        return 'outline'
      default:
        return 'outline'
    }
  }

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
        <h1 className="text-3xl font-bold">Finance Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage users and roles for the Finance module
        </p>
      </div>

      {!canManageRoles && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              You need Finance Administrator privileges to manage roles.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Finance Module Users</CardTitle>
          <CardDescription>
            {users.length} user(s) with access to Finance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Granted</TableHead>
                {canManageRoles && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.user_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.user_email || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role_key)}>
                      {formatRoleLabel(user.role_key as FeaturePermissionLevel)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.granted_at).toLocaleDateString()}
                  </TableCell>
                  {canManageRoles && (
                    <TableCell>
                      <Button variant="ghost" size="sm" disabled>
                        Manage
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManageRoles ? 4 : 3} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

