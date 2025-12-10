import { IUserProfile } from '@repo/core/types/user'

export interface IUserListProps {
  users: IUserProfile[]
  isLoading: boolean
  onEdit: (user: IUserProfile) => void
  onDelete: (userId: string) => void
}

export interface IUserFormProps {
  user?: IUserProfile
  onSuccess?: () => void
  onCancel?: () => void
}

export interface IUserCardProps {
  user: IUserProfile
  onEdit: (user: IUserProfile) => void
  onDelete: (userId: string) => void
}

