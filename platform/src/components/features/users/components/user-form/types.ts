import { IUserProfile } from '@repo/core/types/user'

export interface IUserFormProps {
  user?: IUserProfile
  onSuccess?: () => void
  onCancel?: () => void
}

