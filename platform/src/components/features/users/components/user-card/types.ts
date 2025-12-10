import { IUserProfile } from '@repo/core/types/user'

export interface IUserCardProps {
  user: IUserProfile
  onEdit: (user: IUserProfile) => void
  onDelete: (userId: string) => void
}

