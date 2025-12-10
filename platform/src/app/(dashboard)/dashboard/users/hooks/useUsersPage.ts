import { useState } from 'react'
import { useUsers } from '@/components/features/users/hooks/useUsers'
import { useUserActions } from '@/components/features/users/hooks/useUserActions'
import { IUserProfile } from '@repo/core/types/user'

export const useUsersPage = () => {
  const [editingUser, setEditingUser] = useState<IUserProfile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: users, isLoading } = useUsers()
  const { updateUser, deleteUser } = useUserActions()

  const handleEdit = (user: IUserProfile) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    deleteUser(userId)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  return {
    users: users || [],
    isLoading,
    editingUser,
    isDialogOpen,
    handleEdit,
    handleDelete,
    handleSuccess,
    handleCancel,
  }
}

