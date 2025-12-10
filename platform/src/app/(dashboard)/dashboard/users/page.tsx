'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui'
import { UserCard } from '@/components/features/users/components/user-card'
import { UserForm } from '@/components/features/users/components/user-form'
import { useUsersPage } from './hooks/useUsersPage'

export default function UsersPage() {
  const {
    users,
    isLoading,
    editingUser,
    isDialogOpen,
    handleEdit,
    handleDelete,
    handleSuccess,
    handleCancel,
  } = useUsersPage()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie todos os usuários do sistema
        </p>
      </div>

      {isDialogOpen && editingUser && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Usuário</CardTitle>
            <CardDescription>
              Atualize as informações do usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm
              user={editingUser}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                Nenhum usuário encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

