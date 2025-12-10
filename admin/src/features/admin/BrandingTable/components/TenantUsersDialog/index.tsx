'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@repo/ui/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui'
import { ITenantUsersDialogProps } from '../../types'
import { useTenantUsers } from '../../hooks/useTenantUsers'
import { formatDate } from '@repo/core/utils/date'

export const TenantUsersDialog: React.FC<ITenantUsersDialogProps> = ({
    open,
    onOpenChange,
    tenantId,
    tenantName,
}) => {
    const { users, isLoading } = useTenantUsers(tenantId)

    const getRoleBadgeColor = (role: string) => {
        const roleMap: Record<string, string> = {
            ADMIN: 'bg-red-100 text-red-800',
            admin: 'bg-red-100 text-red-800',
            MANAGER: 'bg-blue-100 text-blue-800',
            manager: 'bg-blue-100 text-blue-800',
            USER: 'bg-green-100 text-green-800',
            user: 'bg-green-100 text-green-800',
        }
        return roleMap[role] || 'bg-gray-100 text-gray-800'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Usuários - {tenantName}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {users?.length || 0} usuário(s) com acesso a esta instância
                    </p>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users && users.length > 0 ? (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.avatar_url || undefined} />
                                            <AvatarFallback>
                                                {user.name
                                                    ?.split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{user.name}</h4>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    Nenhum usuário encontrado para este tenant
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

TenantUsersDialog.displayName = 'TenantUsersDialog'

