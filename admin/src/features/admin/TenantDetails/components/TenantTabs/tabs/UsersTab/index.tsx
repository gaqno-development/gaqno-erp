'use client'

import React from 'react'
import { Card } from '@repo/ui/components/ui'
import { Button } from '@repo/ui/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui'
import { ITenant } from '@repo/core/types/admin'
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useUsersTab } from './hooks/useUsersTab'
import { UserDialog } from './components/UserDialog'
import { formatDate } from '@repo/core/utils/date'

interface IUsersTabProps {
    tenant: ITenant
}

export const UsersTab: React.FC<IUsersTabProps> = ({ tenant }) => {
    const {
        users,
        isLoading,
        selectedUser,
        isDialogOpen,
        handleCreate,
        handleEdit,
        handleDelete,
        handleCloseDialog,
    } = useUsersTab(tenant.tenant_id)

    const getRoleBadgeColor = (role: string) => {
        const roleMap: Record<string, string> = {
            ADMIN: 'bg-red-100 text-red-800 border-red-200',
            admin: 'bg-red-100 text-red-800 border-red-200',
            MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
            manager: 'bg-blue-100 text-blue-800 border-blue-200',
            USER: 'bg-green-100 text-green-800 border-green-200',
            user: 'bg-green-100 text-green-800 border-green-200',
        }
        return roleMap[role] || 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const canAddUsers = (users?.length || 0) < tenant.max_users

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Usuários do Tenant</h3>
                    <p className="text-sm text-muted-foreground">
                        {users?.length || 0} de {tenant.max_users} usuários
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Disponíveis:</span>
                        <span className={`ml-2 font-semibold ${!canAddUsers ? 'text-red-600' : ''}`}>
                            {tenant.max_users - (users?.length || 0)}
                        </span>
                    </div>
                    <Button onClick={handleCreate} disabled={!canAddUsers}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Usuário
                    </Button>
                </div>
            </div>

            {!canAddUsers && (
                <Card className="p-4 bg-orange-50 border-orange-200">
                    <p className="text-sm text-orange-800">
                        ⚠️ Limite de usuários atingido. Aumente o limite do tenant para adicionar mais usuários.
                    </p>
                </Card>
            )}

            {users && users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((user) => (
                        <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {user.name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{user.name}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                                user.role
                                            )}`}
                                        >
                                            {user.role.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(user.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(user)}
                                        >
                                            <Pencil className="h-3 w-3 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(user.id, user.name)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                        Nenhum usuário cadastrado para este tenant
                    </p>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Usuário
                    </Button>
                </Card>
            )}

            <UserDialog
                open={isDialogOpen}
                onOpenChange={handleCloseDialog}
                userData={selectedUser}
                tenantId={tenant.tenant_id}
                tenantName={tenant.name}
            />
        </div>
    )
}

UsersTab.displayName = 'UsersTab'

